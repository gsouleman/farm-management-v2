const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const FarmUser = sequelize.define('FarmUser', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        farm_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'employee'
        },
        permissions: DataTypes.JSONB,
        invited_by: DataTypes.UUID,
        invitation_status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        },
        joined_at: DataTypes.DATE
    }, {
        tableName: 'farm_users',
        timestamps: true,
        underscored: true
    });

    return FarmUser;
};
