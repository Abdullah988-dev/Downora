const express = require("express");
const { analyzeUrl } = require("../controllers/analyzeController");

const router = express.Router();

router.post("/", analyzeUrl);

module.exports = router;