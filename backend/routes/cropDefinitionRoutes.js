const express = require('express');
const router = express.Router();
const cropDefinitionController = require('../controllers/cropDefinitionController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, cropDefinitionController.getAllDefinitions);
router.post('/', auth, cropDefinitionController.createDefinition);
router.put('/:id', auth, cropDefinitionController.updateDefinition);
router.delete('/:id', auth, cropDefinitionController.deleteDefinition);
router.patch('/:id/toggle', auth, cropDefinitionController.toggleStatus);

module.exports = router;
