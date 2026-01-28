const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Document = sequelize.define('Document', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        farm_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: false
        },
        entity_type: DataTypes.STRING,
        entity_id: DataTypes.UUID,
        file_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file_type: DataTypes.STRING,
        file_size: DataTypes.INTEGER,
        file_url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        document_type: DataTypes.STRING,
        description: DataTypes.TEXT,
        tags: DataTypes.ARRAY(DataTypes.STRING)
    }, {
        tableName: 'documents',
        timestamps: true,
        underscored: true
    });

    Document.associate = (models) => {
        Document.belongsTo(models.Farm, { foreignKey: 'farm_id' });
        Document.belongsTo(models.User, { foreignKey: 'uploaded_by' });
    };

    return Document;
};
