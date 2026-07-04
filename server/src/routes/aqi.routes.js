const express = require("express");
const { getLive, getAlerts } = require("../controllers/aqi.controller");

const router = express.Router();

router.get("/live", getLive);
router.get("/alerts", getAlerts);

module.exports = router;
