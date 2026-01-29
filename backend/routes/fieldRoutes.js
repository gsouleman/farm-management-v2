const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/farm/:farmId', fieldController.getFieldsByFarm);
router.get('/:id', fieldController.getFieldById);
router.post('/', fieldController.createField);
router.put('/:id', fieldController.updateField);
router.delete('/:id', fieldController.deleteField);

// Crop sub-routes
const cropController = require('../controllers/cropController');
router.get('/:fieldId/crops', cropController.getCropsByField);
router.post('/:fieldId/crops', (req, res, next) => {
    req.body.field_id = req.params.fieldId;
    next();
}, cropController.createCrop);

module.exports = router;
