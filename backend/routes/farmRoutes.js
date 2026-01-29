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

// Crop sub-routes
const cropController = require('../controllers/cropController');
router.get('/:farmId/crops', cropController.getFarmCrops);

module.exports = router;
