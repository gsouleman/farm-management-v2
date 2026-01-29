const { Contract, Crop, Farm } = require('../models');

exports.getContractsByFarm = async (req, res) => {
    try {
        const contracts = await Contract.findAll({
            where: { farm_id: req.params.farmId },
            include: [{ model: Crop, attributes: ['crop_type', 'variety'] }]
        });
        res.json(contracts);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({ message: 'Error fetching contracts' });
    }
};

exports.createContract = async (req, res) => {
    try {
        const contract = await Contract.create(req.body);
        res.status(201).json(contract);
    } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).json({ message: 'Error creating contract' });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const contract = await Contract.findByPk(req.params.id);
        if (!contract) return res.status(404).json({ message: 'Contract not found' });

        await contract.update(req.body);
        res.json(contract);
    } catch (error) {
        console.error('Error updating contract:', error);
        res.status(500).json({ message: 'Error updating contract' });
    }
};

exports.deleteContract = async (req, res) => {
    try {
        const contract = await Contract.findByPk(req.params.id);
        if (!contract) return res.status(404).json({ message: 'Contract not found' });

        await contract.destroy();
        res.json({ message: 'Contract deleted' });
    } catch (error) {
        console.error('Error deleting contract:', error);
        res.status(500).json({ message: 'Error deleting contract' });
    }
};
