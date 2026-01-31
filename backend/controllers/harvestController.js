const { Harvest, Crop, Field, Activity } = require('../models');

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
        console.log('[HarvestController] Creating harvest:', req.body);
        const harvest = await Harvest.create(req.body);

        // Fetch Crop and Field to get farm_id
        const crop = await Crop.findByPk(harvest.crop_id, {
            include: [{ model: Field }]
        });

        const farm_id = crop?.Field?.farm_id;

        // Create corresponding activity for the timeline
        await Activity.create({
            activity_date: harvest.harvest_date,
            activity_type: 'harvesting',
            transaction_type: 'income',
            crop_id: harvest.crop_id,
            field_id: crop?.field_id,
            farm_id: farm_id,
            total_cost: harvest.total_revenue,
            description: `Harvest Log: ${harvest.quantity} ${harvest.unit} collected.`,
            performed_by: req.user?.id,
            harvest_id: harvest.id
        });

        res.status(201).json(harvest);
    } catch (error) {
        console.error('[HarvestController] Create error:', error);
        res.status(500).json({
            message: 'Error creating harvest',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.updateHarvest = async (req, res) => {
    try {
        const harvest = await Harvest.findByPk(req.params.id);
        if (!harvest) return res.status(404).json({ message: 'Harvest not found' });
        await harvest.update(req.body);

        // Update corresponding activity
        const activity = await Activity.findOne({ where: { harvest_id: harvest.id } });
        if (activity) {
            await activity.update({
                activity_date: harvest.harvest_date,
                total_cost: harvest.total_revenue,
                description: `Harvest Log: ${harvest.quantity} ${harvest.unit} collected.`
            });
        }

        res.json(harvest);
    } catch (error) {
        res.status(500).json({ message: 'Error updating harvest' });
    }
};

exports.deleteHarvest = async (req, res) => {
    try {
        const harvest = await Harvest.findByPk(req.params.id);
        if (!harvest) return res.status(404).json({ message: 'Harvest not found' });

        // Delete corresponding activity
        await Activity.destroy({ where: { harvest_id: harvest.id } });

        await harvest.destroy();
        res.json({ message: 'Harvest deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting harvest' });
    }
};
