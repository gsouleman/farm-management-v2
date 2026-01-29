const { Farm, Field, Activity, Crop, Harvest, Input } = require('../models');

exports.getFarmSummary = async (req, res) => {
    try {
        const { farmId } = req.query;
        const farm = await Farm.findByPk(farmId, {
            include: [
                { model: Field },
                { model: Input }
            ]
        });

        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        const activityCount = await Activity.count({
            include: [{ model: Field, where: { farm_id: farmId } }]
        });

        const farmSummary = {
            farmName: farm.name,
            totalArea: farm.total_area,
            fieldCount: farm.Fields.length,
            activityCount,
            inventoryValue: farm.Inputs.reduce((acc, i) => acc + (parseFloat(i.unit_cost || 0) * parseFloat(i.quantity_in_stock || 0)), 0),
            generatedAt: new Date()
        };

        res.json(farmSummary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating farm summary' });
    }
};

exports.getCropBudget = async (req, res) => {
    try {
        const { farmId } = req.query;
        const crops = await Crop.findAll({
            include: [
                {
                    model: Field,
                    where: { farm_id: farmId },
                    attributes: ['name']
                }
            ]
        });

        // Mock budget calculation for now
        const report = crops.map(crop => ({
            crop: crop.crop_name,
            field: crop.Field.name,
            estimatedRevenue: Math.random() * 500000,
            estimatedCosts: Math.random() * 200000,
            netMargin: 0 // Will be calculated below
        })).map(item => ({
            ...item,
            netMargin: item.estimatedRevenue - item.estimatedCosts
        }));

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating crop budget' });
    }
};

exports.getActivityLog = async (req, res) => {
    try {
        const { farmId } = req.query;
        const activities = await Activity.findAll({
            include: [
                {
                    model: Field,
                    where: { farm_id: farmId },
                    attributes: ['name']
                }
            ],
            order: [['activity_date', 'DESC']]
        });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting activity log' });
    }
};
