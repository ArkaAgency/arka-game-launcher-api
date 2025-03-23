const express = require("express");
const {
  getGameData,
  getGameVersion,
} = require("../../controllers/update/game.controller");
const router = express.Router();

router.get("/", getGameData);
router.get("/version", getGameVersion);

module.exports = router;
