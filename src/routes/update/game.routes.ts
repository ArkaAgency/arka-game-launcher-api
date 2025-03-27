import express from "express";
const {
  getGameData,
  getGameVersion,
} = require("../../controllers/update/game.controller");
const router = express.Router();

router.get("/", getGameData);
router.get("/version", getGameVersion);

export default router;
