const { getLiveAQI, generateAlerts } = require("../services/waqi.service");

/**
 * GET /api/aqi/live?city=London  OR  ?lat=51.5&lon=-0.1
 */
const getLive = async (req, res, next) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (lat === undefined || lon === undefined)) {
      return res.status(400).json({ success: false, error: "Provide city or lat/lon coordinates" });
    }

    const data = await getLiveAQI({
      city,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    });

    res.json({ success: true, data });
  } catch (err) {
    // AQI failures should not crash the app — return graceful error
    res.status(503).json({
      success: false,
      error: err.message || "AQI data unavailable for this location",
    });
  }
};

/**
 * GET /api/aqi/alerts?city=London
 */
const getAlerts = async (req, res, next) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (lat === undefined || lon === undefined)) {
      return res.status(400).json({ success: false, error: "Provide city or lat/lon coordinates" });
    }

    const aqiData = await getLiveAQI({
      city,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    });

    const alerts = generateAlerts(aqiData);

    res.json({
      success: true,
      data: {
        city: city || `(${lat}, ${lon})`,
        aqi_level: aqiData.aqi_level,
        alerts,
        health_advisory: aqiData.health_advisory,
      },
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: err.message || "AQI alert data unavailable",
    });
  }
};

module.exports = { getLive, getAlerts };
