const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // All reporting routes require authentication

router.get('/farm-summary', reportController.getFarmSummary);
router.get('/crop-budget', reportController.getCropBudget);
router.get('/activity-log', reportController.getActivityLog);
router.get('/production-cost/:id', reportController.getCropProductionCost);

module.exports = router;
