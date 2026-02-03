const express = require('express');
const router = express.Router();
const infraDefController = require('../controllers/infrastructureDefinitionController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, infraDefController.getAllDefinitions);
router.post('/', auth, infraDefController.createDefinition);
router.put('/:id', auth, infraDefController.updateDefinition);
router.delete('/:id', auth, infraDefController.deleteDefinition);
router.patch('/:id/toggle', auth, infraDefController.toggleStatus);

module.exports = router;
