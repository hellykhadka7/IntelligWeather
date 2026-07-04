const SearchHistory = require("../models/SearchHistory");

/**
 * GET /api/history
 * Returns the 10 most recent unique city searches.
 */
const getHistory = async (req, res, next) => {
  try {
    const history = await SearchHistory.find()
      .sort({ searched_at: -1 })
      .limit(10)
      .lean();

    res.json({ success: true, data: history });
  } catch (err) {
    // Graceful degradation — return empty if DB is down
    res.json({ success: true, data: [], note: "History unavailable" });
  }
};

/**
 * POST /api/history
 * Body: { city, country, lat, lon }
 * Saves a search event to MongoDB. Deduplicates within 5 minutes.
 */
const saveHistory = async (req, res, next) => {
  try {
    const { city, country, lat, lon } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, error: "city is required" });
    }

    // Deduplication: don't save the same city again within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existing = await SearchHistory.findOne({
      city: { $regex: new RegExp(`^${city}$`, "i") },
      searched_at: { $gte: fiveMinutesAgo },
    });

    if (existing) {
      return res.json({ success: true, data: existing, duplicate: true });
    }

    const record = await SearchHistory.create({ city, country, lat, lon });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    // Non-critical — don't crash on history save failure
    res.json({ success: true, data: null, note: "History save skipped" });
  }
};

/**
 * DELETE /api/history
 * Clears all search history.
 */
const clearHistory = async (req, res, next) => {
  try {
    await SearchHistory.deleteMany({});
    res.json({ success: true, message: "History cleared" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHistory, saveHistory, clearHistory };
