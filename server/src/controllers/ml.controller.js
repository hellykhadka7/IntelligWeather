const { predictTemperature, predictMultiDay, checkMLHealth } = require("../services/ml.service");
const WeatherHistory = require("../models/WeatherHistory");

/**
 * POST /api/ml/predict
 * Body: { city, lat?, lon?, days? }
 *
 * Fetches historical temps from MongoDB, sends to FastAPI ML service.
 */
const predict = async (req, res, next) => {
  try {
    const { city, lat, lon, days } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, error: "city is required" });
    }

    // Load historical temperature data from MongoDB
    const cityKey = city.toLowerCase();
    let history = null;
    try {
      // 1) Exact city_key match (fast path)
      history = await WeatherHistory.findOne({ city_key: cityKey });

      // 2) Lat/lon proximity fallback — OWM resolves lat/lon to a neighborhood
      //    name (e.g. "Parliament House, Delhi") that differs from the geocoding
      //    search name (e.g. "New Delhi"). Compare stored lat/lon within ~0.1°.
      if (!history && lat !== undefined && lon !== undefined) {
        const latF = parseFloat(lat);
        const lonF = parseFloat(lon);
        const all = await WeatherHistory.find({}).lean();
        history = all.find((doc) => {
          if (!doc.lat || !doc.lon) return false;
          return Math.abs(doc.lat - latF) <= 0.1 && Math.abs(doc.lon - lonF) <= 0.1;
        }) || null;
      }
    } catch (_dbErr) {
      return res.status(400).json({
        success: false,
        error: `No historical data for "${city}". Connect MongoDB and search this city a few times to build data.`,
        data_available: 0,
        required: 3,
      });
    }

    if (!history || !history.readings || history.readings.length < 3) {
      return res.status(400).json({
        success: false,
        error: `Not enough historical data for "${city}". Search this city a few times to build up data.`,
        data_available: history?.readings?.length || 0,
        required: 3,
      });
    }

    // filter(r.temp != null) — NOT filter(Boolean) which drops temp=0
    const historicalTemps = history.readings
      .map((r) => r.temp)
      .filter((t) => t !== null && t !== undefined);

    if (historicalTemps.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Insufficient valid temperature readings in history.",
      });
    }

    // If days requested, do multi-day prediction
    if (days && parseInt(days) > 1) {
      const result = await predictMultiDay(city, historicalTemps, parseInt(days));
      return res.json({ success: true, type: "multi-day", data: result });
    }

    // Otherwise, next-day prediction
    const result = await predictTemperature(city, historicalTemps, lat, lon);
    res.json({ success: true, type: "next-day", data: result });
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({
        success: false,
        error: "ML service is unavailable. Please try again later.",
      });
    }
    next(err);
  }
};

/**
 * GET /api/ml/health
 * Proxy health check to FastAPI ML service.
 */
const health = async (req, res) => {
  try {
    const data = await checkMLHealth();
    res.json({ success: true, ml_service: data });
  } catch (_) {
    res.status(503).json({ success: false, error: "ML service unreachable" });
  }
};

module.exports = { predict, health };
