const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// IMPORTANT: Specific routes MUST come before parameterized routes
// Otherwise /all will match /:id and call getCropById with id="all"
router.get('/all', cropController.getAllCrops);
router.get('/field/:fieldId', cropController.getCropsByField);
router.get('/farm/:farmId', cropController.getFarmCrops);
router.get('/', cropController.getFarmCrops); // Fallback for ?farm_id=
router.post('/', cropController.createCrop);

// Parameterized routes come last
router.get('/:id/timeline', cropController.getCropTimeline);
router.get('/:id', cropController.getCropById);
router.put('/:id', cropController.updateCrop);
router.delete('/:id', cropController.deleteCrop);

// Activity sub-routes
const activityController = require('../controllers/activityController');
router.get('/:cropId/activities', activityController.getCropActivities);
router.post('/:cropId/activities', (req, res, next) => {
    req.body.crop_id = req.params.cropId;
    next();
}, activityController.createActivity);

// Harvest sub-routes
const harvestController = require('../controllers/harvestController');
router.get('/:cropId/harvests', harvestController.getCropHarvests);
router.post('/:cropId/harvests', (req, res, next) => {
    req.body.crop_id = req.params.cropId;
    next();
}, harvestController.createHarvest);

module.exports = router;
