const express = require("express");
const { search } = require("../controllers/search.controller");

const router = express.Router();

router.get("/cities", search);

module.exports = router;
