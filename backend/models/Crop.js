const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Crop = sequelize.define('Crop', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        field_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        crop_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        variety: DataTypes.STRING,
        planting_date: DataTypes.DATEONLY,
        expected_harvest_date: DataTypes.DATEONLY,
        actual_harvest_date: DataTypes.DATEONLY,
        planted_area: DataTypes.DECIMAL(10, 2),
        planting_rate: DataTypes.DECIMAL(10, 2),
        row_spacing: DataTypes.DECIMAL(10, 2),
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'planted'
        },
        season: DataTypes.STRING,
        year: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        estimated_cost: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        notes: DataTypes.TEXT
    }, {
        tableName: 'crops',
        timestamps: true,
        underscored: true
    });

    Crop.associate = (models) => {
        Crop.belongsTo(models.Field, { foreignKey: 'field_id' });
        Crop.hasMany(models.Activity, { foreignKey: 'crop_id' });
        Crop.hasMany(models.Harvest, { foreignKey: 'crop_id' });
    };

    return Crop;
};
