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
        const { field_id, crop_type, variety, planting_date, expected_harvest_date, planted_area, planting_rate, row_spacing, season, year, notes } = req.body;

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
            status: 'planted'
        });

        res.status(201).json(crop);
    } catch (error) {
        res.status(500).json({ message: 'Error creating crop' });
    }
};

exports.updateCrop = async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id);
        if (!crop) return res.status(404).json({ message: 'Crop not found' });

        await crop.update(req.body);
        res.json(crop);
    } catch (error) {
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
