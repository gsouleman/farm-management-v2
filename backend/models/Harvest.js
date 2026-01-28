const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Harvest = sequelize.define('Harvest', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        crop_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        harvest_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        area_harvested: DataTypes.DECIMAL(10, 2),
        quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false
        },
        yield_per_area: DataTypes.DECIMAL(10, 2),
        quality_grade: DataTypes.STRING,
        moisture_content: DataTypes.DECIMAL(5, 2),
        storage_location: DataTypes.STRING,
        destination: DataTypes.STRING,
        price_per_unit: DataTypes.DECIMAL(10, 2),
        total_revenue: DataTypes.DECIMAL(10, 2),
        notes: DataTypes.TEXT
    }, {
        tableName: 'harvests',
        timestamps: true,
        underscored: true
    });

    Harvest.associate = (models) => {
        Harvest.belongsTo(models.Crop, { foreignKey: 'crop_id' });
    };

    return Harvest;
};
