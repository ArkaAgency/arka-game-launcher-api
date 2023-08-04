const express = require('express');
const router = express.Router();
const getModsData = require('../../controllers/update/mods.controller');

router.get('/', getModsData);

module.exports = router;
