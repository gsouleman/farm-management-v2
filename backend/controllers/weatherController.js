const { Weather, Farm } = require('../models');

// Simulated weather data generator matching WeatherAPI.com structure
const generateWeatherData = (farm) => {
    const conditions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Patchy rain possible', 'Thundery outbreaks possible'];
    const conditionText = conditions[Math.floor(Math.random() * conditions.length)];

    return {
        temp_c: (20 + Math.random() * 15).toFixed(1),
        humidity: (40 + Math.random() * 40).toFixed(0),
        wind_kph: (5 + Math.random() * 20).toFixed(1),
        condition: {
            text: conditionText,
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png'
        },
        location: {
            name: farm.name,
            region: farm.region || 'Region',
            country: 'Country'
        },
        last_updated: new Date().toISOString()
    };
};

const generateForecast = () => {
    const conditions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Patchy rain possible'];

    return Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        return {
            date: dateStr,
            day: {
                maxtemp_c: (25 + Math.random() * 5).toFixed(1),
                mintemp_c: (15 + Math.random() * 5).toFixed(1),
                condition: {
                    text: conditions[Math.floor(Math.random() * conditions.length)],
                    icon: '//cdn.weatherapi.com/weather/64x64/day/113.png'
                },
                daily_chance_of_rain: (Math.random() * 100).toFixed(0)
            }
        };
    });
};

exports.getCurrentWeather = async (req, res) => {
    try {
        const farm = await Farm.findByPk(req.params.farmId);
        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        // In a real production app, use: axios.get(`https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=${farm.coordinates.lat},${farm.coordinates.lng}`)
        const weather = generateWeatherData(farm);
        res.json(weather);
    } catch (error) {
        console.error(error);
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
        console.error(error);
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
