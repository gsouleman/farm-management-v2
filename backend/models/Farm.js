const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Farm = sequelize.define('Farm', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        owner_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: DataTypes.TEXT,
        city: DataTypes.STRING,
        state: DataTypes.STRING,
        country: DataTypes.STRING,
        postal_code: DataTypes.STRING,
        coordinates: {
            type: DataTypes.GEOMETRY('POINT', 4326)
        },
        total_area: DataTypes.DECIMAL(10, 2),
        area_unit: {
            type: DataTypes.STRING,
            defaultValue: 'hectares'
        },
        farm_type: DataTypes.STRING,
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'farms',
        timestamps: true,
        underscored: true
    });

    Farm.associate = (models) => {
        Farm.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
        Farm.belongsToMany(models.User, { through: models.FarmUser, foreignKey: 'farm_id' });
        Farm.hasMany(models.Field, { foreignKey: 'farm_id' });
        Farm.hasMany(models.Input, { foreignKey: 'farm_id' });
        Farm.hasMany(models.Weather, { foreignKey: 'farm_id' });
        Farm.hasMany(models.Document, { foreignKey: 'farm_id' });
    };

    return Farm;
};
