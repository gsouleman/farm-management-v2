const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:farmId', weatherController.getCurrentWeather);
router.get('/:farmId/forecast', weatherController.getForecast);
router.get('/:farmId/history', weatherController.getWeatherHistory);

module.exports = router;
