const express = require('express');
const getDownloadFile = require('../controllers/download.controller');
const router = express.Router();

router.get('/:filename/:prefix', getDownloadFile);

module.exports = router;
