const { FarmUser, User, Farm } = require('../models');

exports.getFarmTeam = async (req, res) => {
    try {
        const team = await FarmUser.findAll({
            where: { farm_id: req.params.farmId },
            include: [{
                model: User,
                attributes: ['id', 'first_name', 'last_name', 'email']
            }]
        });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team members' });
    }
};

exports.inviteMember = async (req, res) => {
    try {
        const { email, role, permissions } = req.body;
        const farmId = req.params.farmId;

        // Find user by email
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // In a full implementation, we might create a placeholder user or send an email link.
            // For now, we assume the user must already exist in the system.
            return res.status(404).json({ message: 'User with this email not found' });
        }

        // Check if already a member
        const existingMember = await FarmUser.findOne({
            where: { farm_id: farmId, user_id: user.id }
        });

        if (existingMember) {
            return res.status(400).json({ message: 'User is already a member of this farm' });
        }

        const farmUser = await FarmUser.create({
            farm_id: farmId,
            user_id: user.id,
            role: role || 'employee',
            permissions: permissions || {},
            invited_by: req.user.id,
            invitation_status: 'pending'
        });

        // Add user details for frontend
        const result = farmUser.toJSON();
        result.User = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
        };

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error inviting member' });
    }
};

exports.updatePermissions = async (req, res) => {
    try {
        const farmUser = await FarmUser.findByPk(req.params.id);
        if (!farmUser) return res.status(404).json({ message: 'Member not found' });

        await farmUser.update({ permissions: req.body.permissions });
        res.json(farmUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating permissions' });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const farmUser = await FarmUser.findByPk(req.params.id);
        if (!farmUser) return res.status(404).json({ message: 'Member not found' });

        await farmUser.destroy();
        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing member' });
    }
};
