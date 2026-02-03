const { InfrastructureDefinition } = require('../models');

// Initial seed data from agriculturalData.js
const INITIAL_INFRASTRUCTURE = [
    { name: 'Farm House', category: 'Residential', icon: '🏠', color: '#795548', sub_types: ['Management Quarters', 'Staff Housing'] },
    { name: 'General Warehouse', category: 'Storage', icon: '🏭', color: '#607D8B', sub_types: ['Tool Shed', 'Equipment Garage', 'Input Store'] },
    { name: 'Silo / Grain Store', category: 'Storage', icon: '🌾', color: '#FFD700', sub_types: ['Drying Silo', 'Cold Storage'] },
    { name: 'Poultry Pen', category: 'Livestock', icon: '🐔', color: '#FF9800', sub_types: ['Broiler House', 'Layer House', 'Hatchery'] },
    { name: 'Cocoa/Coffee Dryer', category: 'Processing', icon: '♨️', color: '#A0522D', sub_types: ['Solar Dryer', 'Oven Dryer'] },
    { name: 'Oil Press / Mill', category: 'Processing', icon: '⚙️', color: '#E91E63', sub_types: ['Palm Oil Mill', 'Seed Crusher'] },
    { name: 'Irrigation System', category: 'Water', icon: '💧', color: '#2196F3', sub_types: ['Pivot', 'Drip', 'Pump Station'] },
    { name: 'Borehole / Well', category: 'Water', icon: '🚰', color: '#03A9F4', sub_types: ['Electric Pump', 'Manual Pump'] },
    { name: 'Fencing / Gate', category: 'Security', icon: '🚧', color: '#F44336', sub_types: ['Electric Fence', 'Barbed Wire', 'Perimeter Wall'] }
];

exports.getAllDefinitions = async (req, res) => {
    try {
        let definitions = await InfrastructureDefinition.findAll({ order: [['name', 'ASC']] });

        // Auto-seed if empty
        if (definitions.length === 0) {
            await InfrastructureDefinition.bulkCreate(INITIAL_INFRASTRUCTURE);
            definitions = await InfrastructureDefinition.findAll({ order: [['name', 'ASC']] });
        }

        res.json(definitions);
    } catch (error) {
        console.error('Error fetching infrastructure definitions:', error);
        res.status(500).json({ message: 'Failed to fetch infrastructure definitions' });
    }
};

exports.createDefinition = async (req, res) => {
    try {
        const definition = await InfrastructureDefinition.create(req.body);
        res.status(201).json(definition);
    } catch (error) {
        console.error('Error creating infrastructure definition:', error);
        res.status(500).json({ message: 'Failed to create infrastructure definition' });
    }
};

exports.updateDefinition = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await InfrastructureDefinition.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json({ message: 'Definition not found' });

        const updatedDefinition = await InfrastructureDefinition.findByPk(id);
        res.json(updatedDefinition);
    } catch (error) {
        console.error('Error updating infrastructure definition:', error);
        res.status(500).json({ message: 'Failed to update definition' });
    }
};

exports.deleteDefinition = async (req, res) => {
    try {
        const { id } = req.params;
        await InfrastructureDefinition.destroy({ where: { id } });
        res.json({ message: 'Definition deleted' });
    } catch (error) {
        console.error('Error deleting infrastructure definition:', error);
        res.status(500).json({ message: 'Failed to delete definition' });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const definition = await InfrastructureDefinition.findByPk(id);
        if (!definition) return res.status(404).json({ message: 'Definition not found' });

        definition.is_active = !definition.is_active;
        await definition.save();
        res.json(definition);
    } catch (error) {
        console.error('Error toggling status:', error);
        res.status(500).json({ message: 'Failed to toggle status' });
    }
};
