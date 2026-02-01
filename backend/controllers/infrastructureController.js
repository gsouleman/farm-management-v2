const { Infrastructure, Farm, Field } = require('../models');

exports.createInfrastructure = async (req, res) => {
    try {
        const { farm_id } = req.params;
        const { boundary_coordinates, ...rest } = req.body;

        let boundary = null;
        if (boundary_coordinates && Array.isArray(boundary_coordinates) && boundary_coordinates.length >= 3) {
            // Ensure first and last coordinates are the same for a closed polygon
            const closedCoords = [...boundary_coordinates];
            if (
                closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] ||
                closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]
            ) {
                closedCoords.push(closedCoords[0]);
            }

            boundary = {
                type: 'Polygon',
                coordinates: [closedCoords]
            };
        }

        const infra = await Infrastructure.create({
            ...rest,
            farm_id,
            boundary
        });

        res.status(201).json({
            data: infra,
            notification: {
                message: 'INFRASTRUCTURE ASSET REGISTERED SUCCESSFULLY',
                type: 'success'
            }
        });
    } catch (error) {
        console.error('[InfrastructureController] Create Error:', error);
        res.status(500).json({
            message: 'Failed to create infrastructure',
            notification: {
                message: `REGISTRATION FAILED: ${error.message.toUpperCase()}`,
                type: 'error'
            },
            error: error.message
        });
    }
};

exports.getFarmInfrastructure = async (req, res) => {
    try {
        const farmId = req.params.farm_id || req.query.farm_id;
        if (!farmId) {
            return res.status(400).json({ message: 'Farm ID is required' });
        }
        const infra = await Infrastructure.findAll({
            where: { farm_id: farmId },
            include: [{ model: Field, attributes: ['name'] }]
        });
        res.json(infra);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateInfrastructure = async (req, res) => {
    try {
        const { id } = req.params;
        const { boundary_coordinates, ...rest } = req.body;

        const infra = await Infrastructure.findByPk(id);
        if (!infra) return res.status(404).json({ error: 'Infrastructure not found' });

        if (boundary_coordinates && Array.isArray(boundary_coordinates) && boundary_coordinates.length >= 3) {
            const closedCoords = [...boundary_coordinates];
            if (
                closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] ||
                closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]
            ) {
                closedCoords.push(closedCoords[0]);
            }
            infra.boundary = {
                type: 'Polygon',
                coordinates: [closedCoords]
            };
        } else if (boundary_coordinates && boundary_coordinates.length === 0) {
            infra.boundary = null;
        }

        await infra.update(rest);
        res.json({
            data: infra,
            notification: {
                message: 'ASSET CONFIGURATION UPDATED',
                type: 'success'
            }
        });
    } catch (error) {
        console.error('[InfrastructureController] Update Error:', error);
        res.status(500).json({
            message: 'Failed to update infrastructure',
            notification: {
                message: `UPDATE FAILURE: ${error.message.toUpperCase()}`,
                type: 'error'
            },
            error: error.message
        });
    }
};

exports.deleteInfrastructure = async (req, res) => {
    try {
        const { id } = req.params;
        await Infrastructure.destroy({ where: { id } });
        res.json({
            message: 'Infrastructure deleted',
            notification: {
                message: 'ASSET DECOMMISSIONED AND REMOVED FROM REGISTER',
                type: 'success'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting infrastructure',
            notification: {
                message: 'DECOMMISSIONING FAILED: ASSET PROTECTED',
                type: 'error'
            }
        });
    }
};
