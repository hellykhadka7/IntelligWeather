const express = require("express");
const { getHistory, saveHistory, clearHistory } = require("../controllers/history.controller");

const router = express.Router();

router.get("/", getHistory);
router.post("/", saveHistory);
router.delete("/", clearHistory);

module.exports = router;
