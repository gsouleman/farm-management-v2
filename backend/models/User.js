const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: { isEmail: true }
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: DataTypes.STRING,
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'farmer'
        },
        profile_image_url: DataTypes.TEXT,
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'users',
        timestamps: true,
        underscored: true
    });

    User.associate = (models) => {
        User.belongsToMany(models.Farm, { through: models.FarmUser, foreignKey: 'user_id' });
        User.hasMany(models.Activity, { foreignKey: 'performed_by' });
        User.hasMany(models.Document, { foreignKey: 'uploaded_by' });
    };

    return User;
};
