const express = require('express');
const router = express.Router();
const getJavaData = require('../../controllers/update/java.controller');

router.get('/:platform/', getJavaData);

module.exports = router;
