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
        const { name, address, city, state, country, latitude, longitude, total_area, area_unit, farm_type, boundary_coordinates } = req.body;

        // Create point geometry from coordinates
        const coordinates = latitude && longitude ? {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        } : null;

        // Create polygon geometry if boundary_coordinates provided
        const boundary = boundary_coordinates && boundary_coordinates.length > 0 ? {
            type: 'Polygon',
            coordinates: [[...boundary_coordinates.map(p => [p.lng, p.lat]), [boundary_coordinates[0].lng, boundary_coordinates[0].lat]]]
        } : null;

        const farm = await Farm.create({
            owner_id: req.user.id,
            name,
            address,
            city,
            state,
            country,
            coordinates,
            boundary,
            total_area,
            area_unit: area_unit || 'hectares',
            farm_type
        });

        res.status(201).json({
            data: farm,
            notification: {
                message: 'AGRICULTURAL ENTERPRISE REGISTERED - SYSTEM ARCHIVED',
                type: 'success'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error creating farm',
            notification: {
                message: 'REGISTRATION FAILURE: SYSTEM OVERLOAD OR INVALID DATA',
                type: 'error'
            }
        });
    }
};

exports.updateFarm = async (req, res) => {
    try {
        const farm = await Farm.findOne({
            where: { id: req.params.id, owner_id: req.user.id }
        });
        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        const { name, address, city, state, country, latitude, longitude, total_area, area_unit, farm_type, boundary_coordinates } = req.body;

        if (latitude && longitude) {
            farm.coordinates = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        if (boundary_coordinates && boundary_coordinates.length > 0) {
            farm.boundary = {
                type: 'Polygon',
                coordinates: [[...boundary_coordinates.map(p => [p.lng, p.lat]), [boundary_coordinates[0].lng, boundary_coordinates[0].lat]]]
            };
        }

        await farm.update({
            name, address, city, state, country, total_area, area_unit, farm_type,
            boundary: farm.boundary,
            coordinates: farm.coordinates
        });

        res.json({
            data: farm,
            notification: {
                message: 'FARM PROFILE UPDATED - SYNC COMPLETE',
                type: 'success'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating farm',
            notification: {
                message: 'UPDATE FAILURE: DATABASE LOCK',
                type: 'error'
            }
        });
    }
};

exports.deleteFarm = async (req, res) => {
    const { id } = req.params;
    console.log(`[FarmController] DELETION PROTOCOL INITIATED FOR ENTERPRISE: ${id}`);

    try {
        const farm = await Farm.findOne({
            where: { id, owner_id: req.user.id }
        });

        if (!farm) {
            console.warn(`[FarmController] DELETION FAILED: ENTERPRISE ${id} NOT FOUND OR ACCESS DENIED.`);
            return res.status(404).json({ message: 'Farm not found' });
        }

        const { Field, Activity, Infrastructure, Crop, Input, Weather, Document, FarmUser, Harvest, ActivityInput } = require('../models');

        // 1. Get all fields to find related crops
        const fields = await Field.findAll({ where: { farm_id: id } });
        const fieldIds = fields.map(f => f.id);

        // 2. Multi-stage cleanup
        console.log(`[FarmController] CLEANING UP DEPENDENCIES FOR ENTERPRISE: ${id}...`);

        // Activities & Dependencies
        if (Activity) {
            const activities = await Activity.findAll({ where: { farm_id: id } });
            const activityIds = activities.map(a => a.id);

            if (ActivityInput) {
                await ActivityInput.destroy({ where: { activity_id: activityIds } });
            }
            await Activity.destroy({ where: { farm_id: id } });
        }

        // Crops & Harvests
        if (Crop) {
            const crops = await Crop.findAll({ where: { field_id: fieldIds } });
            const cropIds = crops.map(c => c.id);

            if (Harvest) {
                await Harvest.destroy({ where: { crop_id: cropIds } });
            }
            await Crop.destroy({ where: { field_id: fieldIds } });
        }

        // Other Assets
        if (Infrastructure) await Infrastructure.destroy({ where: { farm_id: id } });
        if (Field) await Field.destroy({ where: { farm_id: id } });
        if (Input) await Input.destroy({ where: { farm_id: id } });
        if (Weather) await Weather.destroy({ where: { farm_id: id } });
        if (Document) await Document.destroy({ where: { farm_id: id } });
        if (FarmUser) await FarmUser.destroy({ where: { farm_id: id } });

        // 3. Delete the Farm
        console.log(`[FarmController] DESTROYING PRIMARY ENTERPRISE RECORD: ${id}...`);
        await farm.destroy();

        console.log(`[FarmController] ENTERPRISE ${id} AND ALL ASSOCIATED DATA PURGED.`);
        res.json({
            message: 'Farm and all associated data deleted successfully',
            notification: {
                message: 'ENTERPRISE RECORD PERMANENTLY LIQUIDATED',
                type: 'success'
            }
        });
    } catch (error) {
        console.error('[FarmController] CRITICAL DELETION ERROR:', error);
        res.status(500).json({
            message: 'Error deleting farm',
            notification: {
                message: `DELETE FAILURE: ${error.message.toUpperCase()}`,
                type: 'error'
            },
            error: error.message
        });
    }
};
