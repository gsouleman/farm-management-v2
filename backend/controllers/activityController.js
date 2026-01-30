const { Activity, Crop, Field, Input, ActivityInput, Infrastructure } = require('../models');

const recalculateInfraCost = async (infrastructure_id) => {
    if (!infrastructure_id) return;
    try {
        const total = await Activity.sum('total_cost', {
            where: { infrastructure_id }
        });
        await Infrastructure.update(
            { cost: total || 0 },
            { where: { id: infrastructure_id } }
        );
    } catch (error) {
        console.error('Error recalculating infra cost:', error);
    }
};

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
        const activityData = {
            ...req.body,
            performed_by: req.user.id,
            transaction_type: req.body.transaction_type || 'expense',
            labor_cost: req.body.labor_cost || 0,
            material_cost: req.body.material_cost || 0,
            equipment_cost: req.body.equipment_cost || 0,
            service_cost: req.body.service_cost || 0,
            transport_cost: req.body.transport_cost || 0,
            other_cost: req.body.other_cost || 0,
            total_cost: req.body.total_cost || 0
        };

        const activity = await Activity.create(activityData);

        if (req.body.inputs && req.body.inputs.length > 0) {
            for (const item of req.body.inputs) {
                const input = await Input.findByPk(item.input_id);
                const itemCost = input ? (parseFloat(input.unit_cost || 0) * parseFloat(item.quantity_used || 0)) : 0;

                await ActivityInput.create({
                    activity_id: activity.id,
                    input_id: item.input_id,
                    quantity_used: item.quantity_used,
                    unit: item.unit || (input ? input.unit : ''),
                    cost: itemCost
                });

                if (input) {
                    await input.update({
                        quantity_in_stock: parseFloat(input.quantity_in_stock) - parseFloat(item.quantity_used)
                    });
                }
            }
        }

        if (activity.infrastructure_id) {
            await recalculateInfraCost(activity.infrastructure_id);
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

        const oldInfraId = activity.infrastructure_id;
        const updateData = {
            ...req.body,
            transaction_type: req.body.transaction_type || activity.transaction_type || 'expense'
        };
        await activity.update(updateData);

        if (activity.infrastructure_id) {
            await recalculateInfraCost(activity.infrastructure_id);
        }
        if (oldInfraId && oldInfraId !== activity.infrastructure_id) {
            await recalculateInfraCost(oldInfraId);
        }

        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Error updating activity' });
    }
};

exports.deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });

        const infraId = activity.infrastructure_id;
        await activity.destroy();

        if (infraId) {
            await recalculateInfraCost(infraId);
        }

        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting activity' });
    }
};
