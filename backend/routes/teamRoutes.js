const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.put('/:id/permissions', teamController.updatePermissions);
router.delete('/:id', teamController.removeMember);

module.exports = router;
