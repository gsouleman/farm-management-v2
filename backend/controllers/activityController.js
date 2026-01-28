const { Activity, Crop, Field, Input, ActivityInput } = require('../models');

exports.getCropActivities = async (req, res) => {
    try {
        const activities = await Activity.findAll({
            where: { crop_id: req.params.cropId },
            include: [Input]
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activities' });
    }
};

exports.getFarmActivities = async (req, res) => {
    try {
        const activities = await Activity.findAll({
            include: [{
                model: Field,
                where: { farm_id: req.params.farmId }
            }, Input]
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching farm activities' });
    }
};

exports.createActivity = async (req, res) => {
    try {
        const { crop_id, field_id, activity_type, activity_date, description, inputs } = req.body;

        const activity = await Activity.create({
            crop_id,
            field_id,
            performed_by: req.user.id,
            activity_type,
            activity_date,
            description
        });

        if (inputs && inputs.length > 0) {
            for (const item of inputs) {
                await ActivityInput.create({
                    activity_id: activity.id,
                    input_id: item.input_id,
                    quantity_used: item.quantity_used,
                    unit: item.unit
                });

                // Update input quantity in stock
                const input = await Input.findByPk(item.input_id);
                if (input) {
                    await input.update({
                        quantity_in_stock: parseFloat(input.quantity_in_stock) - parseFloat(item.quantity_used)
                    });
                }
            }
        }

        res.status(201).json(activity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating activity' });
    }
};

exports.updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });

        await activity.update(req.body);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Error updating activity' });
    }
};

exports.deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });

        await activity.destroy();
        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting activity' });
    }
};
