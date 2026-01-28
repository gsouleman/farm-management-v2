const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Field = sequelize.define('Field', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        farm_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        field_number: DataTypes.STRING,
        boundary: {
            type: DataTypes.GEOMETRY('POLYGON', 4326),
            allowNull: false
        },
        area: DataTypes.DECIMAL(10, 2),
        area_unit: {
            type: DataTypes.STRING,
            defaultValue: 'hectares'
        },
        soil_type: DataTypes.STRING,
        drainage: DataTypes.STRING,
        slope: DataTypes.STRING,
        irrigation: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        notes: DataTypes.TEXT,
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'fields',
        timestamps: true,
        underscored: true
    });

    Field.associate = (models) => {
        Field.belongsTo(models.Farm, { foreignKey: 'farm_id' });
        Field.hasMany(models.Crop, { foreignKey: 'field_id' });
        Field.hasMany(models.Activity, { foreignKey: 'field_id' });
    };

    return Field;
};
