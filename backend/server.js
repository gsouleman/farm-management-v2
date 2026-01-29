const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Placeholder
app.get('/', (req, res) => {
    res.json({ message: 'Farm Management API is running' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/farms', require('./routes/farmRoutes'));
app.use('/api/fields', require('./routes/fieldRoutes'));
app.use('/api/crops', require('./routes/cropRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/inputs', require('./routes/inputRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/exports', require('./routes/exportRoutes'));
app.use('/api/harvests', require('./routes/harvestRoutes'));

// Database sync and server start
const startServer = async () => {
    try {
        // Enable PostGIS extension
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        console.log('PostGIS extension verified.');

        // Sync models (in production, use migrations)
        await sequelize.sync({ alter: true });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
