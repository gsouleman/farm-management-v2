const { Harvest, Crop, Field } = require('../models');

exports.getHarvests = async (req, res) => {
    try {
        const harvests = await Harvest.findAll({
            include: [{ model: Crop, include: [Field] }]
        });
        res.json(harvests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching harvests' });
    }
};

exports.getHarvestById = async (req, res) => {
    try {
        const harvest = await Harvest.findByPk(req.params.id, {
            include: [{ model: Crop, include: [Field] }]
        });
        if (!harvest) return res.status(404).json({ message: 'Harvest not found' });
        res.json(harvest);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching harvest details' });
    }
};

exports.getFarmHarvests = async (req, res) => {
    try {
        const harvests = await Harvest.findAll({
            include: [{
                model: Crop,
                required: true,
                include: [{
                    model: Field,
                    where: { farm_id: req.params.farmId },
                    required: true
                }]
            }]
        });
        res.json(harvests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching farm harvests' });
    }
};

exports.getCropHarvests = async (req, res) => {
    try {
        const harvests = await Harvest.findAll({
            where: { crop_id: req.params.cropId }
        });
        res.json(harvests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching crop harvests' });
    }
};

exports.createHarvest = async (req, res) => {
    try {
        const harvest = await Harvest.create(req.body);
        res.status(201).json(harvest);
    } catch (error) {
        res.status(500).json({ message: 'Error creating harvest' });
    }
};

exports.updateHarvest = async (req, res) => {
    try {
        const harvest = await Harvest.findByPk(req.params.id);
        if (!harvest) return res.status(404).json({ message: 'Harvest not found' });
        await harvest.update(req.body);
        res.json(harvest);
    } catch (error) {
        res.status(500).json({ message: 'Error updating harvest' });
    }
};

exports.deleteHarvest = async (req, res) => {
    try {
        const harvest = await Harvest.findByPk(req.params.id);
        if (!harvest) return res.status(404).json({ message: 'Harvest not found' });
        await harvest.destroy();
        res.json({ message: 'Harvest deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting harvest' });
    }
};
