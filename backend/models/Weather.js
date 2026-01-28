const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Weather = sequelize.define('Weather', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        farm_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        temperature_max: DataTypes.DECIMAL(5, 2),
        temperature_min: DataTypes.DECIMAL(5, 2),
        temperature_avg: DataTypes.DECIMAL(5, 2),
        precipitation: DataTypes.DECIMAL(5, 2),
        humidity: DataTypes.DECIMAL(5, 2),
        wind_speed: DataTypes.DECIMAL(5, 2),
        conditions: DataTypes.STRING,
        source: DataTypes.STRING
    }, {
        tableName: 'weather_data',
        timestamps: true,
        underscored: true
    });

    Weather.associate = (models) => {
        Weather.belongsTo(models.Farm, { foreignKey: 'farm_id' });
    };

    return Weather;
};
