const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.use(auth); // All reporting routes require authentication

router.get('/farm-summary', reportController.getFarmSummary);
router.get('/crop-budget', reportController.getCropBudget);
router.get('/activity-log', reportController.getActivityLog);

module.exports = router;
