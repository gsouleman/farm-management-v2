const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middleware/auth');

router.use(auth); // All export routes require authentication

router.get('/fields/geojson', exportController.exportGeoJSON);
router.get('/fields/shapefile', exportController.exportShapefile);
router.get('/excel', exportController.exportExcel);

module.exports = router;
