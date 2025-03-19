const express = require("express");
const {
  processMicrosoftAuth,
  getMicrosoftAuthLink,
  hostRedirect,
} = require("../../controllers/auth/microsoft.controller");
const router = express.Router();

router.get("/auth-link", getMicrosoftAuthLink);
router.get("/process-auth/:code", processMicrosoftAuth);
router.get("/redirect", hostRedirect);

module.exports = router;
