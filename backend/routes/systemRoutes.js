const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const auth = require('../middleware/authMiddleware');

router.get('/messages', auth, systemController.getSystemMessages);
router.get('/confirmations/:action', auth, systemController.getConfirmation);

module.exports = router;
