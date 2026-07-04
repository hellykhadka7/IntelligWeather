const { searchCities } = require("../services/openweather.service");

/**
 * GET /api/search/cities?q=London&limit=5
 */
const search = async (req, res, next) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Query must be at least 2 characters" });
    }

    const results = await searchCities(q.trim(), parseInt(limit) || 5);

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

module.exports = { search };
