const { InfrastructureDefinition } = require('../models');

// Initial seed data from agriculturalData.js
const INITIAL_INFRASTRUCTURE = [
    { name: 'Farm House', category: 'Residential', icon: '🏠', color: '#795548', sub_types: ['Management Quarters', 'Staff Housing', 'Guest House'] },
    { name: 'General Warehouse', category: 'Storage', icon: '🏭', color: '#607D8B', sub_types: ['Large Scale Store', 'Equipment Garage', 'Input Store'] },
    { name: 'Silo / Grain Store', category: 'Storage', icon: '🌾', color: '#FFD700', sub_types: ['Drying Silo', 'Cold Storage Silo', 'Bulk Loader'] },
    { name: 'Cold Storage / Fridge', category: 'Storage', icon: '🧊', color: '#00BCD4', sub_types: ['Fruit Cold Room', 'Vegetable Chiller', 'Meat Locker'] },
    { name: 'Fertilizer/Chemical Store', category: 'Security', icon: '🧪', color: '#9C27B0', sub_types: ['Pesticide Bunker', 'Bio-Fertilizer Pit'] },
    { name: 'Poultry Pen', category: 'Livestock', icon: '🐔', color: '#FF9800', sub_types: ['Broiler House', 'Layer House', 'Hatchery'] },
    { name: 'Piggery / Swine Shed', category: 'Livestock', icon: '🐖', color: '#F06292', sub_types: ['Farrowing Pen', 'Gestation Stall'] },
    { name: 'Livestock Paddock', category: 'Livestock', icon: '🐄', color: '#8D6E63', sub_types: ['Cattle Yard', 'Goat Shed', 'Sheep Fold'] },
    { name: 'Fish Pond / Aquaculture', category: 'Livestock', icon: '🐟', color: '#2196F3', sub_types: ['Concrete Tank', 'Earthen Pond', 'Nursery Tank'] },
    { name: 'Bee Apiary', category: 'Livestock', icon: '🐝', color: '#FFEB3B', sub_types: ['Modern Hive', 'Traditional Log'] },
    { name: 'Cocoa/Coffee Dryer', category: 'Processing', icon: '♨️', color: '#A0522D', sub_types: ['Solar Dryer', 'Oven Dryer', 'Fermentation Box'] },
    { name: 'Oil Press / Mill', category: 'Processing', icon: '⚙️', color: '#E91E63', sub_types: ['Palm Oil Mill', 'Seed Crusher', 'Soap Facility'] },
    { name: 'Sorting & Grading Hall', category: 'Processing', icon: '🏗️', color: '#9E9E9E', sub_types: ['Packing Line', 'Quality Lab'] },
    { name: 'Nursery / Greenhouse', category: 'Production', icon: '🪴', color: '#4CAF50', sub_types: ['Plug Tray Rack', 'Hydroponic Unit', 'Shade House'] },
    { name: 'Composting Area', category: 'Production', icon: '♻️', color: '#33691E', sub_types: ['Bokashi Pit', 'Vermicompost Bin'] },
    { name: 'Irrigation System', category: 'Water', icon: '💧', color: '#2196F3', sub_types: ['Center Pivot', 'Drip Station', 'Hydrant Network'] },
    { name: 'Borehole / Well', category: 'Water', icon: '🚰', color: '#03A9F4', sub_types: ['Deep Well', 'Shallow Well', 'Water Tower'] },
    { name: 'Solar Power Plant', category: 'Energy', icon: '🔋', color: '#FF5722', sub_types: ['PV Array', 'Battery Room', 'Inverter Shed'] },
    { name: 'Security Post', category: 'Security', icon: '🛡️', color: '#37474F', sub_types: ['Gate House', 'Watchtower', 'CCTV Hub'] },
    { name: 'Staff Canteen/Clinic', category: 'Residential', icon: '🍱', color: '#FFCDD2', sub_types: ['Workers Kitchen', 'First Aid Station'] },
    { name: 'Fencing / Gate', category: 'Security', icon: '🚧', color: '#F44336', sub_types: ['Electric Fence', 'Perimeter Wall'] }
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
