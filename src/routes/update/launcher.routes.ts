import express from "express";
const router = express.Router();
const {
  getLauncherVersion,
} = require("../../controllers/update/launcher.controller");

router.get("/version", getLauncherVersion);

export default router;
