const express = require("express");

const {
  getTestMedia,
} = require("../controllers/testMediaController");

const router = express.Router();

router.get("/", getTestMedia);

module.exports = router;