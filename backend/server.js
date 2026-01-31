const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const activityController = require('./controllers/activityController');
const cropController = require('./controllers/cropController');
const infraController = require('./controllers/infrastructureController');
const auth = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for mobile compatibility
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for easier mobile testing
}));
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
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/infrastructure', require('./routes/infrastructureRoutes')); // Added infrastructure routes
app.use('/api/farm-users', require('./routes/teamRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));

// Aggressive fallback routes for sync (handles ?farm_id=)
app.get('/api/activities', auth, activityController.getFarmActivities);
app.get('/api/crops', auth, cropController.getFarmCrops);
app.get('/api/infrastructure', auth, infraController.getFarmInfrastructure);

// Static files for uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database sync and server start
const startServer = async () => {
    try {
        // Enable PostGIS extension
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        console.log('PostGIS extension verified.');

        // Sync models (in production, use migrations)
        await sequelize.sync({ alter: true });

        // Backfill farm_id for activities if missing (one-time migration helper)
        const { Activity, Farm } = require('./models');
        const firstFarm = await Farm.findOne();
        if (firstFarm) {
            const [updatedCount] = await Activity.update(
                { farm_id: firstFarm.id },
                { where: { farm_id: null } }
            );
            if (updatedCount > 0) {
                console.log(`[Startup] Backfilled ${updatedCount} activities with farmId: ${firstFarm.id}`);
            }
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT} and accessible on the local network`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
