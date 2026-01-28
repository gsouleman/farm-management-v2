const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/crop/:cropId', activityController.getCropActivities);
router.get('/farm/:farmId', activityController.getFarmActivities);
router.post('/', activityController.createActivity);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

module.exports = router;
