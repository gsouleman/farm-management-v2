const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ActivityInput = sequelize.define('ActivityInput', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        activity_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        input_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        quantity_used: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false
        },
        application_rate: DataTypes.DECIMAL(10, 2),
        application_method: DataTypes.STRING,
        cost: DataTypes.DECIMAL(10, 2)
    }, {
        tableName: 'activity_inputs',
        timestamps: true,
        underscored: true,
        updatedAt: false
    });

    return ActivityInput;
};
