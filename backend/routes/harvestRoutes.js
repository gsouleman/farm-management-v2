const express = require('express');
const router = express.Router();
const harvestController = require('../controllers/harvestController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', harvestController.getHarvests);
router.get('/:id', harvestController.getHarvestById);
router.put('/:id', harvestController.updateHarvest);
router.delete('/:id', harvestController.deleteHarvest);

module.exports = router;
