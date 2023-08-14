const express = require('express');
const {processMicrosoftAuth, getMicrosoftAuthLink} = require('../../controllers/auth/microsoft.controller');
const router = express.Router();

router.get('/auth-link', getMicrosoftAuthLink);
router.get('/process-auth/:code', processMicrosoftAuth);

module.exports = router;
