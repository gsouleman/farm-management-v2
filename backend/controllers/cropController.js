const { Crop, Field, Activity, Harvest, Input, Farm } = require('../models');
const { Op } = require('sequelize');

exports.getCropById = async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id, {
            include: [{ model: Field }]
        });
        if (!crop) return res.status(404).json({ message: 'Crop not found' });
        res.json(crop);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching crop details' });
    }
};

// ... existing getCropTimeline ...
// ... existing getCropsByField ...
// ... existing getFarmCrops ...

exports.getAllCrops = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find all farms owned by user first
        const userFarms = await Farm.findAll({
            where: { owner_id: req.user.id },
            attributes: ['id']
        });

        const farmIds = userFarms.map(f => f.id);

        if (farmIds.length === 0) return res.json([]);

        const crops = await Crop.findAll({
            include: [{
                model: Field,
                required: true,
                where: {
                    farm_id: { [Op.in]: farmIds }
                },
                include: [{ model: Farm, attributes: ['name', 'id'] }]
            }]
        });

        res.json(crops);
    } catch (error) {
        console.error('Error fetching all user crops:', error);
        res.status(500).json({ message: 'Error fetching all crops: ' + error.message });
    }
};

exports.getCropTimeline = async (req, res) => {
    try {
        const cropId = req.params.id;

        const [activities, harvests] = await Promise.all([
            Activity.findAll({
                where: { crop_id: cropId },
                include: [{ model: Input }],
                order: [['activity_date', 'DESC']]
            }),
            Harvest.findAll({
                where: { crop_id: cropId },
                order: [['harvest_date', 'DESC']]
            })
        ]);

        const timeline = [
            ...activities.map(a => ({
                id: a.id,
                type: 'activity',
                date: a.activity_date,
                title: a.activity_type,
                description: a.description,
                meta: {
                    duration: a.duration_hours,
                    inputs: a.Inputs?.map(i => i.input_name)
                }
            })),
            ...harvests.map(h => ({
                id: h.id,
                type: 'harvest',
                date: h.harvest_date,
                title: 'Harvest Recorded',
                description: `Yield: ${h.quantity} ${h.unit} (${h.quality_grade})`,
                meta: {
                    revenue: h.total_revenue
                }
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(timeline);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching crop timeline' });
    }
};

exports.getCropsByField = async (req, res) => {
    try {
        const crops = await Crop.findAll({
            where: { field_id: req.params.fieldId }
        });
        res.json(crops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching crops' });
    }
};

exports.getFarmCrops = async (req, res) => {
    try {
        const farmId = req.params.farmId || req.query.farm_id;
        if (!farmId) {
            return res.status(400).json({ message: 'Farm ID is required' });
        }
        const crops = await Crop.findAll({
            include: [{
                model: Field,
                where: { farm_id: farmId }
            }]
        });
        res.json(crops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching farm crops' });
    }
};


exports.createCrop = async (req, res) => {
    try {
        const {
            field_id, crop_type, variety, planting_date, expected_harvest_date,
            planted_area, planting_rate, row_spacing, season, year, notes,
            boundary_coordinates, estimated_cost
        } = req.body;

        let boundary = null;
        if (boundary_coordinates && boundary_coordinates.length > 0) {
            let normalizedCoords = boundary_coordinates.map(coord => {
                if (Array.isArray(coord)) return coord;
                if (coord && typeof coord === 'object' && coord.lat !== undefined) {
                    return [parseFloat(coord.lng), parseFloat(coord.lat)];
                }
                return coord;
            });

            // Ensure closed polygon ring
            const first = normalizedCoords[0];
            const last = normalizedCoords[normalizedCoords.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                normalizedCoords.push(first);
            }

            boundary = {
                type: 'Polygon',
                coordinates: [normalizedCoords]
            };
        }

        const crop = await Crop.create({
            field_id,
            crop_type,
            variety,
            planting_date,
            expected_harvest_date,
            planted_area,
            planting_rate,
            row_spacing,
            season,
            year,
            notes,
            boundary,
            estimated_cost,
            status: 'planted'
        });

        // If coordinates provided but area wasn't, calculate area server-side
        if (boundary && !planted_area) {
            try {
                const { sequelize } = require('../models');
                const [result] = await sequelize.query(
                    `SELECT ST_Area(ST_GeogFromGeoJSON(:boundary)) / 10000 AS area_hectares`,
                    {
                        replacements: { boundary: JSON.stringify(boundary) },
                        type: sequelize.QueryTypes.SELECT
                    }
                );

                if (result && result.area_hectares) {
                    await crop.update({ planted_area: result.area_hectares });
                }
            } catch (areaError) {
                console.error('Crop area calculation failed:', areaError);
            }
        }

        res.status(201).json({
            data: crop,
            notification: {
                message: 'CROP PLANTING REGISTERED SUCCESSFULLY',
                type: 'success'
            }
        });
    } catch (error) {
        console.error('CRITICAL CROP CREATION ERROR:', error);

        // Handle specific validation/database errors
        const isUuidError = error.name === 'SequelizeDatabaseError' && error.message.includes('uuid');
        const errorMsg = isUuidError ? 'Invalid Field selected. Please ensure a valid field is chosen.' : 'Internal Server Error';

        res.status(500).json({
            message: errorMsg,
            notification: {
                message: `CROP REGISTRATION FAILED: ${error.message.toUpperCase()}`,
                type: 'error'
            },
            error: error.message
        });
    }
};

exports.updateCrop = async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id);
        if (!crop) return res.status(404).json({ message: 'Crop not found' });

        const { boundary_coordinates, ...otherData } = req.body;

        if (boundary_coordinates) {
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

            otherData.boundary = {
                type: 'Polygon',
                coordinates: [normalizedCoords]
            };

            // Recalculate area
            try {
                const { sequelize } = require('../models');
                const [result] = await sequelize.query(
                    `SELECT ST_Area(ST_GeogFromGeoJSON(:boundary)) / 10000 AS area_hectares`,
                    {
                        replacements: { boundary: JSON.stringify(otherData.boundary) },
                        type: sequelize.QueryTypes.SELECT
                    }
                );
                if (result && result.area_hectares) {
                    otherData.planted_area = result.area_hectares;
                }
            } catch (areaError) {
                console.error('Crop area calculation failed:', areaError);
            }
        }

        await crop.update(otherData);
        res.json({
            data: crop,
            notification: {
                message: 'PLANTING RECORDS UPDATED',
                type: 'success'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error updating crop',
            notification: {
                message: 'UPDATE FAILURE: SYSTEM SYNC INTERRUPTED',
                type: 'error'
            }
        });
    }
};

exports.deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id);
        if (!crop) return res.status(404).json({ message: 'Crop not found' });

        await crop.destroy();
        res.json({
            message: 'Crop deleted successfully',
            notification: {
                message: 'CROP ASSET REMOVED FROM OPERATIONAL REGISTRY',
                type: 'success'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting crop',
            notification: {
                message: 'LIQUIDATION FAILED: ASSET PROTECTED BY SYSTEM',
                type: 'error'
            }
        });
    }
};
