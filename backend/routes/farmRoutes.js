const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', farmController.getFarms);
router.get('/:id', farmController.getFarmById);
router.post('/', farmController.createFarm);
router.put('/:id', farmController.updateFarm);
router.delete('/:id', farmController.deleteFarm);

// Field sub-routes
const fieldController = require('../controllers/fieldController');
router.get('/:farmId/fields', fieldController.getFieldsByFarm);
router.post('/:farmId/fields', (req, res, next) => {
    req.body.farm_id = req.params.farmId;
    next();
}, fieldController.createField);

// Activity sub-routes
const activityController = require('../controllers/activityController');
router.get('/:farmId/activities', activityController.getFarmActivities);

// Harvest sub-routes
const harvestController = require('../controllers/harvestController');
router.get('/:farmId/harvests', harvestController.getFarmHarvests);

// Weather sub-routes
const weatherController = require('../controllers/weatherController');
router.get('/:farmId/weather', weatherController.getCurrentWeather);
router.get('/:farmId/weather/forecast', weatherController.getForecast);
router.get('/:farmId/weather/history', weatherController.getWeatherHistory);

// Document sub-routes
const documentController = require('../controllers/documentController');
router.get('/:farmId/documents', documentController.getFarmDocuments);

// Team sub-routes
const teamController = require('../controllers/teamController');
router.get('/:farmId/team', teamController.getFarmTeam);
router.post('/:farmId/invite', teamController.inviteMember);

// Input sub-routes
const inputController = require('../controllers/inputController');
router.get('/:farmId/inputs', inputController.getInputsByFarm);
router.post('/:farmId/inputs', (req, res, next) => {
    req.body.farm_id = req.params.farmId;
    next();
}, inputController.createInput);

// Crop sub-routes
const cropController = require('../controllers/cropController');
router.get('/:farmId/crops', cropController.getFarmCrops);

module.exports = router;
