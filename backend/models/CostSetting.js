const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const CostSetting = sequelize.define('CostSetting', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        farm_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING, // e.g., 'Labor', 'Machinery', 'Inputs'
            allowNull: false
        },
        name: {
            type: DataTypes.STRING, // e.g., 'General Weeding'
            allowNull: false
        },
        unit: {
            type: DataTypes.STRING, // e.g., 'Day', 'Ha', 'L'
            allowNull: true
        },
        unit_cost: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        billing_frequency: {
            type: DataTypes.STRING, // 'per_unit', 'fixed', 'monthly'
            defaultValue: 'per_unit'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'cost_settings',
        timestamps: true
    });

    CostSetting.associate = (models) => {
        CostSetting.belongsTo(models.Farm, { foreignKey: 'farm_id' });
    };

    return CostSetting;
};
