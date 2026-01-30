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
        harvest_id: DataTypes.UUID,
        farm_id: {
            type: DataTypes.UUID,
            allowNull: true // Reverting to nullable to debug 500 creation errors
        },
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
        priority: DataTypes.STRING,
        work_status: DataTypes.STRING,
        transaction_type: {
            type: DataTypes.STRING,
            defaultValue: 'expense' // expense, income
        },
        labor_cost: DataTypes.DECIMAL(15, 2),
        material_cost: DataTypes.DECIMAL(15, 2),
        equipment_cost: DataTypes.DECIMAL(15, 2),
        service_cost: DataTypes.DECIMAL(15, 2),
        transport_cost: DataTypes.DECIMAL(15, 2),
        other_cost: DataTypes.DECIMAL(15, 2),
        total_cost: DataTypes.DECIMAL(15, 2),
        payment_method: DataTypes.STRING,
        num_workers: DataTypes.INTEGER,
        weather_conditions: DataTypes.TEXT,
        temperature: DataTypes.DECIMAL(5, 2),
        equipment_used: DataTypes.TEXT,
        component: DataTypes.STRING,
        materials_used: DataTypes.TEXT,
        next_maintenance: DataTypes.DATEONLY,
        issues: DataTypes.TEXT,
        supplier_name: DataTypes.STRING,
        supplier_contact: DataTypes.STRING,
        invoice_number: DataTypes.STRING,
        warranty: DataTypes.STRING,
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
        Activity.belongsTo(models.Farm, { foreignKey: 'farm_id' });
        Activity.belongsTo(models.User, { foreignKey: 'performed_by' });
        Activity.belongsToMany(models.Input, { through: models.ActivityInput, foreignKey: 'activity_id' });
    };

    return Activity;
};
