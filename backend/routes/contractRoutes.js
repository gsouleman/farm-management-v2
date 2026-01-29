const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/farm/:farmId', authMiddleware, contractController.getContractsByFarm);
router.post('/', authMiddleware, contractController.createContract);
router.put('/:id', authMiddleware, contractController.updateContract);
router.delete('/:id', authMiddleware, contractController.deleteContract);

module.exports = router;
