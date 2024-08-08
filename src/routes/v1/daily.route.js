const express = require('express');
const dailyController = require('../../controllers/daily.controller');

const router = express.Router();

router.get('/:userId', dailyController.getDaily);

module.exports = router;
