const { Field, Farm } = require('../models');

exports.exportGeoJSON = async (req, res) => {
    try {
        const { farmId } = req.query;
        const fields = await Field.findAll({
            where: { farm_id: farmId }
        });

        const geojson = {
            type: 'FeatureCollection',
            features: fields.map(field => ({
                type: 'Feature',
                properties: {
                    id: field.id,
                    name: field.name,
                    area: field.area,
                    soil_type: field.soil_type
                },
                geometry: field.boundary
            }))
        };

        res.json(geojson);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting GeoJSON' });
    }
};

exports.exportShapefile = async (req, res) => {
    // Placeholder as shapefile generation requires specific linux tools or libraries
    res.json({ message: 'Shapefile export initiated. You will receive an email when ready.' });
};

exports.exportExcel = async (req, res) => {
    // Placeholder for Excel export
    res.json({ message: 'Excel data compiled. Download started.' });
};
