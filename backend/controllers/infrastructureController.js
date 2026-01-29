const { Infrastructure, Farm, Field } = require('../models');

exports.createInfrastructure = async (req, res) => {
    try {
        const { farm_id } = req.params;
        const { boundary_coordinates, ...rest } = req.body;

        let boundary = null;
        if (boundary_coordinates && boundary_coordinates.length >= 3) {
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

        res.status(201).json(infra);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getFarmInfrastructure = async (req, res) => {
    try {
        const { farm_id } = req.params;
        const infra = await Infrastructure.findAll({
            where: { farm_id },
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

        if (boundary_coordinates) {
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
        }

        await infra.update(rest);
        res.json(infra);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteInfrastructure = async (req, res) => {
    try {
        const { id } = req.params;
        await Infrastructure.destroy({ where: { id } });
        res.json({ message: 'Infrastructure deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
