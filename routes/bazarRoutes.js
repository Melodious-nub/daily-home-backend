const express = require('express');
const router = express.Router();
const bazarController = require('../controllers/bazarController');

router.get('/', bazarController.getBazars);
router.post('/', bazarController.addBazar);
router.delete('/:id', bazarController.deleteBazar);

module.exports = router;
