const express = require('express');
const router = express.Router();
const calculateController = require('../controllers/calculateController');

router.get('/summary', calculateController.getSummaryByDateRange);

module.exports = router;
