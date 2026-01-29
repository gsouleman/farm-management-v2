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
        const { name, farm_id, boundary_coordinates, soil_type, field_number, notes, irrigation, drainage, slope, area, area_unit } = req.body;

        // Validate farm ownership
        const farm = await Farm.findOne({ where: { id: farm_id, owner_id: req.user.id } });
        if (!farm) return res.status(403).json({ message: 'Unauthorized farm access' });

        // Normalize coordinates and ensure closed polygon ring
        let normalizedCoords = (boundary_coordinates || []).map(coord => {
            if (Array.isArray(coord)) return coord;
            if (coord && typeof coord === 'object' && coord.lat !== undefined) {
                return [parseFloat(coord.lng), parseFloat(coord.lat)];
            }
            return coord;
        });

        if (normalizedCoords.length > 0) {
            const first = normalizedCoords[0];
            const last = normalizedCoords[normalizedCoords.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                normalizedCoords.push(first);
            }
        }

        const boundary = {
            type: 'Polygon',
            coordinates: [normalizedCoords]
        };

        // Create field
        const field = await Field.create({
            farm_id,
            name,
            field_number,
            boundary,
            soil_type,
            notes,
            irrigation: irrigation || false,
            drainage,
            slope,
            area: area || 0,
            area_unit: area_unit || 'hectares'
        });

        // Calculate area using PostGIS
        try {
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
        } catch (areaError) {
            console.error('Area calculation failed:', areaError);
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

        const updateData = {
            name,
            soil_type,
            field_number,
            notes,
            irrigation,
            drainage,
            slope
        };

        if (boundary_coordinates && boundary_coordinates.length > 0) {
            let normalizedCoords = boundary_coordinates.map(coord => {
                if (Array.isArray(coord)) return coord;
                if (coord && typeof coord === 'object' && coord.lat !== undefined) {
                    return [parseFloat(coord.lng), parseFloat(coord.lat)];
                }
                return coord;
            });

            const first = normalizedCoords[0];
            const last = normalizedCoords[normalizedCoords.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                normalizedCoords.push(first);
            }

            const boundary = {
                type: 'Polygon',
                coordinates: [normalizedCoords]
            };
            updateData.boundary = boundary;

            try {
                const [result] = await sequelize.query(
                    `SELECT ST_Area(ST_GeogFromGeoJSON(:boundary)) / 10000 AS area_hectares`,
                    {
                        replacements: { boundary: JSON.stringify(boundary) },
                        type: sequelize.QueryTypes.SELECT
                    }
                );
                if (result && result.area_hectares) {
                    updateData.area = result.area_hectares;
                }
            } catch (areaError) {
                console.error('Area calculation failed during update:', areaError);
            }
        }

        await field.update(updateData);
        res.json(field);
    } catch (error) {
        console.error('Update Field Error:', error);
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
