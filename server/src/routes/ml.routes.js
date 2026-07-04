const express = require("express");
const { predict, health } = require("../controllers/ml.controller");

const router = express.Router();

router.post("/predict", predict);
router.get("/health", health);

module.exports = router;
