const { Crop, Field } = require('../models');

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
