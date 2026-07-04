const express = require("express");
const { getCurrent, getForecastData } = require("../controllers/weather.controller");

const router = express.Router();

router.get("/current", getCurrent);
router.get("/forecast", getForecastData);

module.exports = router;
