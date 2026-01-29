const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: console.log
});

const models = {
    User: require('./User')(sequelize),
    Farm: require('./Farm')(sequelize),
    Field: require('./Field')(sequelize),
    Crop: require('./Crop')(sequelize),
    Activity: require('./Activity')(sequelize),
    Input: require('./Input')(sequelize),
    Harvest: require('./Harvest')(sequelize),
    Weather: require('./Weather')(sequelize),
    Document: require('./Document')(sequelize),
    ActivityInput: require('./ActivityInput')(sequelize),
    FarmUser: require('./FarmUser')(sequelize),
    Infrastructure: require('./Infrastructure')(sequelize)
};

// Set up associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = {
    sequelize,
    ...models
};
