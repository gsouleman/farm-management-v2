const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Contract = sequelize.define('Contract', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        farm_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        contract_type: {
            type: DataTypes.ENUM('sales', 'purchase'),
            allowNull: false
        },
        partner_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        crop_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price_per_unit: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total_value: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('draft', 'active', 'completed', 'cancelled'),
            defaultValue: 'draft'
        },
        delivery_terms: DataTypes.TEXT,
        payment_terms: DataTypes.TEXT,
        notes: DataTypes.TEXT
    }, {
        tableName: 'contracts',
        timestamps: true,
        underscored: true
    });

    Contract.associate = (models) => {
        Contract.belongsTo(models.Farm, { foreignKey: 'farm_id' });
        Contract.belongsTo(models.Crop, { foreignKey: 'crop_id' });
    };

    return Contract;
};
