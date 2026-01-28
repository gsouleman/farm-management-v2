const express = require('express');
const router = express.Router();
const inputController = require('../controllers/inputController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/farm/:farmId', inputController.getInputsByFarm);
router.post('/', inputController.createInput);
router.put('/:id', inputController.updateInput);
router.delete('/:id', inputController.deleteInput);

module.exports = router;
