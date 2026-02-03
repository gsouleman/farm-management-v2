module.exports = (sequelize, DataTypes) => {
    const InfrastructureDefinition = sequelize.define('InfrastructureDefinition', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING,
            defaultValue: '🏗️'
        },
        color: {
            type: DataTypes.STRING,
            defaultValue: '#2196F3' // Default Blue
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        sub_types: {
            type: DataTypes.JSONB, // Store common sub-types/varieties as an array
            defaultValue: []
        }
    }, {
        tableName: 'infrastructure_definitions',
        timestamps: true
    });

    return InfrastructureDefinition;
};
