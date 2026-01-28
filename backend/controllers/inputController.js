const { Input, Farm } = require('../models');

exports.getInputsByFarm = async (req, res) => {
    try {
        const inputs = await Input.findAll({
            where: { farm_id: req.params.farmId }
        });
        res.json(inputs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inputs' });
    }
};

exports.createInput = async (req, res) => {
    try {
        const { farm_id, input_type, name, brand, category, unit, quantity_in_stock, unit_cost, supplier } = req.body;

        const input = await Input.create({
            farm_id,
            input_type,
            name,
            brand,
            category,
            unit,
            quantity_in_stock,
            unit_cost,
            supplier
        });

        res.status(201).json(input);
    } catch (error) {
        res.status(500).json({ message: 'Error creating input' });
    }
};

exports.updateInput = async (req, res) => {
    try {
        const input = await Input.findByPk(req.params.id);
        if (!input) return res.status(404).json({ message: 'Input not found' });

        await input.update(req.body);
        res.json(input);
    } catch (error) {
        res.status(500).json({ message: 'Error updating input' });
    }
};

exports.deleteInput = async (req, res) => {
    try {
        const input = await Input.findByPk(req.params.id);
        if (!input) return res.status(404).json({ message: 'Input not found' });

        await input.destroy();
        res.json({ message: 'Input deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting input' });
    }
};
