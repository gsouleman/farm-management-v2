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

module.exports = router;
