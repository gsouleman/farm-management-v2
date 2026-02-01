module.exports = (sequelize, DataTypes) => {
    const CropDefinition = sequelize.define('CropDefinition', {
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
        varieties: {
            type: DataTypes.JSONB, // Store varieties as an array of strings
            defaultValue: []
        },
        icon: {
            type: DataTypes.STRING,
            defaultValue: '🌱'
        },
        color: {
            type: DataTypes.STRING,
            defaultValue: '#4caf50' // Default green
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'crop_definitions',
        timestamps: true
    });

    return CropDefinition;
};
