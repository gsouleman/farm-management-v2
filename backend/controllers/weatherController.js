const { Weather, Farm } = require('../models');

// Simulated weather data generator
const generateWeatherData = (farm) => {
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Stormy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
        temperature: (20 + Math.random() * 15).toFixed(1),
        humidity: (40 + Math.random() * 40).toFixed(0),
        windSpeed: (5 + Math.random() * 20).toFixed(1),
        conditions: condition,
        location: farm.city || farm.name,
        timestamp: new Date()
    };
};

const generateForecast = () => {
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();

    return Array.from({ length: 7 }).map((_, i) => {
        const dayIndex = (today + i) % 7;
        return {
            day: days[dayIndex],
            tempHigh: (22 + Math.random() * 8).toFixed(0),
            tempLow: (15 + Math.random() * 5).toFixed(0),
            conditions: conditions[Math.floor(Math.random() * conditions.length)],
            precipitation: (Math.random() * 100).toFixed(0) + '%'
        };
    });
};

exports.getCurrentWeather = async (req, res) => {
    try {
        const farm = await Farm.findByPk(req.params.farmId);
        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        // In a real app, you'd call OpenWeatherMap here using farm coordinates
        const weather = generateWeatherData(farm);
        res.json(weather);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weather data' });
    }
};

exports.getForecast = async (req, res) => {
    try {
        const farm = await Farm.findByPk(req.params.farmId);
        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        const forecast = generateForecast();
        res.json(forecast);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching forecast' });
    }
};

exports.getWeatherHistory = async (req, res) => {
    try {
        const history = await Weather.findAll({
            where: { farm_id: req.params.farmId },
            limit: 30,
            order: [['date', 'DESC']]
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weather history' });
    }
};
