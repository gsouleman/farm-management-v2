const { CostSetting } = require('../models');

exports.getFarmCostSettings = async (req, res) => {
    try {
        const { farmId } = req.params;
        const settings = await CostSetting.findAll({
            where: { farm_id: farmId },
            order: [['category', 'ASC'], ['name', 'ASC']]
        });
        res.json(settings);
    } catch (error) {
        console.error('Error fetching cost settings:', error);
        res.status(500).json({ message: 'Error fetching cost settings' });
    }
};

exports.createCostSetting = async (req, res) => {
    try {
        const { farmId } = req.params;
        const { category, name, unit, unit_cost, billing_frequency, notes } = req.body;

        const setting = await CostSetting.create({
            farm_id: farmId,
            category,
            name,
            unit,
            unit_cost: unit_cost || 0,
            billing_frequency,
            notes
        });

        res.status(201).json(setting);
    } catch (error) {
        console.error('Error creating cost setting:', error);
        res.status(500).json({ message: 'Error creating cost setting' });
    }
};

exports.updateCostSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const setting = await CostSetting.findByPk(id);

        if (!setting) {
            return res.status(404).json({ message: 'Cost setting not found' });
        }

        await setting.update(req.body);
        res.json(setting);
    } catch (error) {
        console.error('Error updating cost setting:', error);
        res.status(500).json({ message: 'Error updating cost setting' });
    }
};

exports.deleteCostSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const setting = await CostSetting.findByPk(id);

        if (!setting) {
            return res.status(404).json({ message: 'Cost setting not found' });
        }

        await setting.destroy();
        res.json({ message: 'Cost setting deleted successfully' });
    } catch (error) {
        console.error('Error deleting cost setting:', error);
        res.status(500).json({ message: 'Error deleting cost setting' });
    }
};
