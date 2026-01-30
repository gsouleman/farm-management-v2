const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Activity = sequelize.define('Activity', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        crop_id: DataTypes.UUID,
        field_id: DataTypes.UUID,
        infrastructure_id: DataTypes.UUID,
        performed_by: DataTypes.UUID,
        activity_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        activity_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        start_time: DataTypes.TIME,
        end_time: DataTypes.TIME,
        duration_hours: DataTypes.DECIMAL(10, 2),
        area_covered: DataTypes.DECIMAL(10, 2),
        description: DataTypes.TEXT,
        weather_conditions: DataTypes.TEXT,
        temperature: DataTypes.DECIMAL(5, 2),
        equipment_used: DataTypes.TEXT,
        labor_cost: DataTypes.DECIMAL(10, 2),
        notes: DataTypes.TEXT
    }, {
        tableName: 'activities',
        timestamps: true,
        underscored: true
    });

    Activity.associate = (models) => {
        Activity.belongsTo(models.Crop, { foreignKey: 'crop_id' });
        Activity.belongsTo(models.Field, { foreignKey: 'field_id' });
        Activity.belongsTo(models.Infrastructure, { foreignKey: 'infrastructure_id' });
        Activity.belongsTo(models.User, { foreignKey: 'performed_by' });
        Activity.belongsToMany(models.Input, { through: models.ActivityInput, foreignKey: 'activity_id' });
    };

    return Activity;
};
