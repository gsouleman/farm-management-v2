const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:id', cropController.getCropById);
router.get('/:id/timeline', cropController.getCropTimeline);
router.put('/:id', cropController.updateCrop);
router.delete('/:id', cropController.deleteCrop);

// These will also be mounted on /api/fields and /api/farms for convenience
router.get('/field/:fieldId', cropController.getCropsByField);
router.get('/farm/:farmId', cropController.getFarmCrops);
router.post('/', cropController.createCrop);

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
