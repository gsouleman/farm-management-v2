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
        const { name, farm_id, boundary_coordinates, soil_type, field_number, notes, irrigation, drainage, slope, area, perimeter, area_unit, status, crop_id, carbon_sequestration, water_efficiency } = req.body;

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
            perimeter: perimeter || 0,
            area_unit: area_unit || 'hectares',
            status: status || 'active',
            crop_id: crop_id || null,
            carbon_sequestration: carbon_sequestration || 0,
            water_efficiency: water_efficiency || 100
        });

        // Calculate area using PostGIS
        try {
            const [result] = await sequelize.query(
                `SELECT 
                    ST_Area(ST_GeogFromGeoJSON(:boundary)) / 10000 AS area_hectares,
                    ST_Perimeter(ST_GeogFromGeoJSON(:boundary)) AS perimeter_meters`,
                {
                    replacements: { boundary: JSON.stringify(boundary) },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (result) {
                const updates = {};
                if (result.area_hectares !== undefined) updates.area = result.area_hectares;
                if (result.perimeter_meters !== undefined) updates.perimeter = result.perimeter_meters;
                await field.update(updates);
            }
        } catch (areaError) {
            console.error('Area calculation failed for new field:', areaError);
        }

        res.status(201).json({
            data: field,
            notification: {
                message: 'FIELD BOUNDARY ESTABLISHED AND ARCHIVED',
                type: 'success'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error creating field',
            notification: {
                message: `REGISTRATION FAILED: ${error.message.toUpperCase()}`,
                type: 'error'
            }
        });
    }
};

exports.updateField = async (req, res) => {
    try {
        const field = await Field.findByPk(req.params.id);
        if (!field) return res.status(404).json({ message: 'Field not found' });

        const { name, boundary_coordinates, soil_type, field_number, notes, irrigation, drainage, slope, area, perimeter, status, crop_id, carbon_sequestration, water_efficiency } = req.body;

        const updateData = {
            name,
            soil_type,
            field_number,
            notes,
            irrigation,
            drainage,
            slope,
            area,
            perimeter,
            status,
            crop_id,
            carbon_sequestration,
            water_efficiency
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
                    `SELECT 
                        ST_Area(ST_GeogFromGeoJSON(:boundary)) / 10000 AS area_hectares,
                        ST_Perimeter(ST_GeogFromGeoJSON(:boundary)) AS perimeter_meters`,
                    {
                        replacements: { boundary: JSON.stringify(boundary) },
                        type: sequelize.QueryTypes.SELECT
                    }
                );
                if (result) {
                    if (result.area_hectares !== undefined) updateData.area = result.area_hectares;
                    if (result.perimeter_meters !== undefined) updateData.perimeter = result.perimeter_meters;
                }
            } catch (areaError) {
                console.error('Area calculation failed during boundary update:', areaError);
            }
        } else if ((!field.area || parseFloat(field.area) === 0) && field.boundary) {
            // Force recalculation for existing fields with 0 area
            try {
                const [result] = await sequelize.query(
                    `SELECT ST_Area(boundary) / 10000 AS area_hectares FROM fields WHERE id = :id`,
                    {
                        replacements: { id: field.id },
                        type: sequelize.QueryTypes.SELECT
                    }
                );
                if (result && result.area_hectares !== undefined) {
                    updateData.area = result.area_hectares;
                }
            } catch (recalcError) {
                console.error('Forced area metric recalculation failed:', recalcError);
            }
        }

        await field.update(updateData);
        res.json({
            data: field,
            notification: {
                message: 'FIELD PROFILE UPDATED SUCCESSFULLY',
                type: 'success'
            }
        });
    } catch (error) {
        console.error('Update Field Error:', error);
        res.status(500).json({
            message: 'Error updating field',
            notification: {
                message: 'UPDATE FAILURE: DATABASE LOCK OR SYNC ERROR',
                type: 'error'
            }
        });
    }
};

exports.deleteField = async (req, res) => {
    try {
        const field = await Field.findByPk(req.params.id);
        if (!field) return res.status(404).json({ message: 'Field not found' });

        await field.destroy();
        res.json({
            message: 'Field deleted successfully',
            notification: {
                message: 'FIELD REMOVED FROM OPERATIONAL REGISTRY',
                type: 'success'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting field',
            notification: {
                message: 'DELETE FAILURE: PARCEL LINKED TO ACTIVE CROPS',
                type: 'error'
            }
        });
    }
};
