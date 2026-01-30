const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Infrastructure = sequelize.define('Infrastructure', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        farm_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        field_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING, // Farm House, Storage, Poultry, Irrigation, etc.
            allowNull: false
        },
        sub_type: {
            type: DataTypes.STRING, // Silo, Warehouse, Cold Storage, etc.
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'operational' // operational, under_construction, maintenance, retired
        },
        construction_date: DataTypes.DATEONLY,
        cost: DataTypes.DECIMAL(15, 2),
        area_sqm: DataTypes.DECIMAL(10, 2),
        perimeter: DataTypes.DECIMAL(10, 2),
        boundary_manual: DataTypes.TEXT,
        boundary: {
            type: DataTypes.GEOMETRY('POLYGON', 4326),
            allowNull: true
        },
        notes: DataTypes.TEXT
    }, {
        tableName: 'infrastructure',
        timestamps: true,
        underscored: true
    });

    Infrastructure.associate = (models) => {
        Infrastructure.belongsTo(models.Farm, { foreignKey: 'farm_id' });
        Infrastructure.belongsTo(models.Field, { foreignKey: 'field_id' });
        Infrastructure.hasMany(models.Activity, { foreignKey: 'infrastructure_id' });
    };

    return Infrastructure;
};
