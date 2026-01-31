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
        console.log('[HarvestController] Creating harvest:', JSON.stringify(req.body, null, 2));

        // Robust sanitization to handle empty strings from frontend becoming numeric errors in DB
        const cleanedData = {
            ...req.body,
            area_harvested: req.body.area_harvested || 0,
            quantity: req.body.quantity || 0,
            unit: req.body.unit || 'kg',
            yield_per_area: req.body.yield_per_area || 0,
            moisture_content: req.body.moisture_content || null,
            price_per_unit: req.body.price_per_unit || 0,
            total_revenue: req.body.total_revenue || 0
        };

        const harvest = await Harvest.create(cleanedData);

        // Fetch Crop and Field to get farm_id
        const crop = await Crop.findByPk(harvest.crop_id, {
            include: [{ model: Field }]
        });

        // Resolve farm_id from associations
        const farm_id = crop?.Field?.farm_id || crop?.field?.farm_id || null;

        // Create corresponding activity for the timeline (Wrapped in its own try/catch to ensure harvest success)
        try {
            await Activity.create({
                activity_date: harvest.harvest_date,
                activity_type: 'harvesting',
                transaction_type: 'income',
                crop_id: harvest.crop_id,
                field_id: crop?.field_id,
                farm_id: farm_id,
                total_cost: parseFloat(harvest.total_revenue) || 0,
                description: `Harvest Log: ${harvest.quantity} ${harvest.unit} collected.`,
                performed_by: req.user?.id,
                harvest_id: harvest.id
            });
        } catch (activityError) {
            console.error('[HarvestController] Activity auto-creation failed, but harvest was successfully archived:', activityError);
        }

        res.status(201).json(harvest);
    } catch (error) {
        console.error('[HarvestController] Create error:', error);
        res.status(500).json({
            message: 'Error creating harvest: ' + error.message,
            error: error.message,
            detail: error.original ? error.original.detail : undefined,
            hint: error.original ? error.original.hint : undefined
        });
    }
};

exports.updateHarvest = async (req, res) => {
    try {
        const harvest = await Harvest.findByPk(req.params.id);
        if (!harvest) return res.status(404).json({ message: 'Harvest not found' });

        // Sanitize update data
        const updateData = {
            ...req.body,
            area_harvested: req.body.area_harvested !== undefined ? (req.body.area_harvested || 0) : harvest.area_harvested,
            quantity: req.body.quantity !== undefined ? (req.body.quantity || 0) : harvest.quantity,
            total_revenue: req.body.total_revenue !== undefined ? (req.body.total_revenue || 0) : harvest.total_revenue
        };

        await harvest.update(updateData);

        // Update corresponding activity
        const activity = await Activity.findOne({ where: { harvest_id: harvest.id } });
        if (activity) {
            await activity.update({
                activity_date: harvest.harvest_date,
                total_cost: parseFloat(harvest.total_revenue) || 0,
                description: `Harvest Log: ${harvest.quantity} ${harvest.unit} collected.`
            });
        }

        res.json(harvest);
    } catch (error) {
        console.error('[HarvestController] Update error:', error);
        res.status(500).json({
            message: 'Error updating harvest: ' + error.message,
            error: error.message
        });
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
