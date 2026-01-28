const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/field/:fieldId', cropController.getCropsByField);
router.get('/farm/:farmId', cropController.getFarmCrops);
router.post('/', cropController.createCrop);
router.put('/:id', cropController.updateCrop);
router.delete('/:id', cropController.deleteCrop);

module.exports = router;
