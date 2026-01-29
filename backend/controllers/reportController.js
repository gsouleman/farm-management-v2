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

        const report = await Promise.all(crops.map(async (crop) => {
            const activities = await Activity.findAll({
                where: { crop_id: crop.id },
                include: [{ model: Input }]
            });

            let actualLaborCost = 0;
            let actualInputCost = 0;

            activities.forEach(activity => {
                actualLaborCost += parseFloat(activity.labor_cost || 0);
                activity.Inputs.forEach(input => {
                    actualInputCost += parseFloat(input.ActivityInput.cost || 0);
                });
            });

            const totalActualCost = actualLaborCost + actualInputCost;
            const estimatedCost = parseFloat(crop.estimated_cost || 0);

            return {
                crop: crop.crop_type,
                field: crop.Field.name,
                estimatedCosts: estimatedCost,
                actualCosts: totalActualCost,
                variance: estimatedCost - totalActualCost,
                netMargin: 0 // In a real scenario, this would involve Harvest revenue
            };
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

exports.getCropProductionCost = async (req, res) => {
    try {
        const { id } = req.params;
        const crop = await Crop.findByPk(id, {
            include: [
                {
                    model: Activity,
                    include: [{ model: Input }]
                }
            ]
        });

        if (!crop) return res.status(404).json({ message: 'Crop not found' });

        let actualLaborCost = 0;
        let actualInputCost = 0;

        crop.Activities.forEach(activity => {
            actualLaborCost += parseFloat(activity.labor_cost || 0);

            // We need to get the cost from ActivityInput, but since we included Input 
            // via the belongsToMany association, Sequelize might put the join table data 
            // in activity.Inputs[i].ActivityInput
            activity.Inputs.forEach(input => {
                actualInputCost += parseFloat(input.ActivityInput.cost || 0);
            });
        });

        const totalActualCost = actualLaborCost + actualInputCost;

        res.json({
            cropId: crop.id,
            cropType: crop.crop_type,
            estimatedCost: parseFloat(crop.estimated_cost || 0),
            actualLaborCost,
            actualInputCost,
            totalActualCost,
            variance: parseFloat(crop.estimated_cost || 0) - totalActualCost,
            variancePercentage: crop.estimated_cost > 0
                ? ((parseFloat(crop.estimated_cost) - totalActualCost) / parseFloat(crop.estimated_cost) * 100).toFixed(2)
                : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error calculating production cost' });
    }
};
