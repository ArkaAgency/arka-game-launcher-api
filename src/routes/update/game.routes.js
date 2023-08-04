const express = require('express');
const getGameData = require('../../controllers/update/game.controller');
const router = express.Router();

router.get('/', getGameData);

module.exports = router;
