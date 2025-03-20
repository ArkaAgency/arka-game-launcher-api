const express = require("express");
const router = express.Router();
const {
  getLauncherVersion,
} = require("../../controllers/update/launcher.controller");

router.get("/version", getLauncherVersion);

module.exports = router;
