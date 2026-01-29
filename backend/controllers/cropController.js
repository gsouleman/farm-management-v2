const { Crop, Field, Activity, Harvest, Input } = require('../models');

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
        const crops = await Crop.findAll({
            include: [{
                model: Field,
                where: { farm_id: req.params.farmId }
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
            boundary_coordinates
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

        res.status(201).json(crop);
    } catch (error) {
        console.error('CRITICAL CROP CREATION ERROR:', error);

        // Handle specific validation/database errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                details: error.errors.map(e => e.message)
            });
        }

        if (error.name === 'SequelizeDatabaseError' && error.message.includes('uuid')) {
            return res.status(400).json({ message: 'Invalid Field selected. Please ensure a valid field is chosen.' });
        }

        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        res.json(crop);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating crop' });
    }
};

exports.deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id);
        if (!crop) return res.status(404).json({ message: 'Crop not found' });

        await crop.destroy();
        res.json({ message: 'Crop deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting crop' });
    }
};
