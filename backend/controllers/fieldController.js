const { Field, Farm } = require('../models');
const { sequelize } = require('../models');

exports.getFieldsByFarm = async (req, res) => {
    try {
        const fields = await Field.findAll({
            where: { farm_id: req.params.farmId }
        });
        res.json(fields);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fields' });
    }
};

exports.getFieldById = async (req, res) => {
    try {
        const field = await Field.findByPk(req.params.id);
        if (!field) return res.status(404).json({ message: 'Field not found' });
        res.json(field);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching field' });
    }
};

exports.createField = async (req, res) => {
    try {
        const { name, farm_id, boundary_coordinates, soil_type, field_number, notes } = req.body;

        // Validate farm ownership
        const farm = await Farm.findOne({ where: { id: farm_id, owner_id: req.user.id } });
        if (!farm) return res.status(403).json({ message: 'Unauthorized farm access' });

        // Create polygon geometry
        // boundary_coordinates should be [[lng, lat], [lng, lat], ...]
        const boundary = {
            type: 'Polygon',
            coordinates: [boundary_coordinates]
        };

        // Create field (PostGIS will handle area calculation if triggered, or we can use a query)
        const field = await Field.create({
            farm_id,
            name,
            field_number,
            boundary,
            soil_type,
            notes
        });

        // Optionally calculate area using PostGIS and update
        const [result] = await sequelize.query(
            `SELECT ST_Area(ST_GeogFromGeoJSON(:boundary)) / 10000 AS area_hectares`,
            {
                replacements: { boundary: JSON.stringify(boundary) },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (result && result.area_hectares) {
            await field.update({ area: result.area_hectares });
        }

        res.status(201).json(field);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating field' });
    }
};

exports.updateField = async (req, res) => {
    try {
        const field = await Field.findByPk(req.params.id);
        if (!field) return res.status(404).json({ message: 'Field not found' });

        const { name, boundary_coordinates, soil_type, field_number, notes, irrigation, drainage, slope } = req.body;

        if (boundary_coordinates) {
            field.boundary = {
                type: 'Polygon',
                coordinates: [boundary_coordinates]
            };

            const [result] = await sequelize.query(
                `SELECT ST_Area(ST_GeogFromGeoJSON(:boundary)) / 10000 AS area_hectares`,
                {
                    replacements: { boundary: JSON.stringify(field.boundary) },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            if (result && result.area_hectares) {
                field.area = result.area_hectares;
            }
        }

        await field.update({
            name, soil_type, field_number, notes, irrigation, drainage, slope
        });

        res.json(field);
    } catch (error) {
        res.status(500).json({ message: 'Error updating field' });
    }
};

exports.deleteField = async (req, res) => {
    try {
        const field = await Field.findByPk(req.params.id);
        if (!field) return res.status(404).json({ message: 'Field not found' });

        await field.destroy();
        res.json({ message: 'Field deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting field' });
    }
};
