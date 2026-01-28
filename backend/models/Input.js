const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Input = sequelize.define('Input', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        farm_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        input_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        brand: DataTypes.STRING,
        category: DataTypes.STRING,
        active_ingredient: DataTypes.TEXT,
        unit: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity_in_stock: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        unit_cost: DataTypes.DECIMAL(10, 2),
        supplier: DataTypes.STRING,
        purchase_date: DataTypes.DATEONLY,
        expiry_date: DataTypes.DATEONLY,
        storage_location: DataTypes.STRING,
        notes: DataTypes.TEXT
    }, {
        tableName: 'inputs',
        timestamps: true,
        underscored: true
    });

    Input.associate = (models) => {
        Input.belongsTo(models.Farm, { foreignKey: 'farm_id' });
        Input.belongsToMany(models.Activity, { through: models.ActivityInput, foreignKey: 'input_id' });
    };

    return Input;
};
