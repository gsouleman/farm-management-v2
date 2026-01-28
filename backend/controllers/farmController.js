const { Farm, User } = require('../models');
const { validationResult } = require('express-validator');

exports.getFarms = async (req, res) => {
    try {
        const farms = await Farm.findAll({
            where: { owner_id: req.user.id }
        });
        res.json(farms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching farms' });
    }
};

exports.getFarmById = async (req, res) => {
    try {
        const farm = await Farm.findOne({
            where: { id: req.params.id, owner_id: req.user.id }
        });
        if (!farm) return res.status(404).json({ message: 'Farm not found' });
        res.json(farm);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching farm' });
    }
};

exports.createFarm = async (req, res) => {
    try {
        const { name, address, city, state, country, latitude, longitude, total_area, area_unit, farm_type } = req.body;

        // Create point geometry from coordinates
        const coordinates = latitude && longitude ? {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        } : null;

        const farm = await Farm.create({
            owner_id: req.user.id,
            name,
            address,
            city,
            state,
            country,
            coordinates,
            total_area,
            area_unit: area_unit || 'hectares',
            farm_type
        });

        res.status(201).json(farm);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating farm' });
    }
};

exports.updateFarm = async (req, res) => {
    try {
        const farm = await Farm.findOne({
            where: { id: req.params.id, owner_id: req.user.id }
        });
        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        const { name, address, city, state, country, latitude, longitude, total_area, area_unit, farm_type } = req.body;

        if (latitude && longitude) {
            farm.coordinates = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        await farm.update({
            name, address, city, state, country, total_area, area_unit, farm_type
        });

        res.json(farm);
    } catch (error) {
        res.status(500).json({ message: 'Error updating farm' });
    }
};

exports.deleteFarm = async (req, res) => {
    try {
        const farm = await Farm.findOne({
            where: { id: req.params.id, owner_id: req.user.id }
        });
        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        await farm.destroy();
        res.json({ message: 'Farm deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting farm' });
    }
};
