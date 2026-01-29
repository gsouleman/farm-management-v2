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

// Activity sub-routes
const activityController = require('../controllers/activityController');
router.get('/:fieldId/activities', async (req, res) => {
    try {
        const { Activity, Input } = require('../models');
        const activities = await Activity.findAll({
            where: { field_id: req.params.fieldId },
            include: [Input]
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching field activities' });
    }
});

module.exports = router;
