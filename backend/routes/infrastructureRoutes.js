const express = require('express');
const router = express.Router();
const infraController = require('../controllers/infrastructureController');
const auth = require('../middleware/authMiddleware');

router.post('/farm/:farm_id', auth, infraController.createInfrastructure);
router.get('/farm/:farm_id', auth, infraController.getFarmInfrastructure);
router.put('/:id', auth, infraController.updateInfrastructure);
router.delete('/:id', auth, infraController.deleteInfrastructure);

module.exports = router;
