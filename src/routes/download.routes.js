const express = require('express');
const getDownloadFile = require('../controllers/download.controller');
const router = express.Router();

router.get('/:type/:filename', getDownloadFile);

module.exports = router;
