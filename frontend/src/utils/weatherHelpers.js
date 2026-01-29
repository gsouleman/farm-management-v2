// Utility functions for AgriXP Weather Clone

export const getSprayCondition = (windSpeed, precipitation) => {
    if (precipitation > 0 || windSpeed > 15) return { status: 'POOR', color: '#e74c3c', tip: 'Risk of drift or wash-off. Avoid spraying.' };
    if (windSpeed > 10) return { status: 'FAIR', color: '#f39c12', tip: 'Check nozzle types for drift control.' };
    return { status: 'EXCELLENT', color: '#27ae60', tip: 'Ideal conditions for application.' };
};

export const calculateGDD = (maxTemp, minTemp, baseTemp = 10) => {
    const avg = (maxTemp + minTemp) / 2;
    return Math.max(0, avg - baseTemp).toFixed(1);
};

export const getAIRecommendation = (weather) => {
    const { temperature_avg, conditions, wind_speed } = weather || {};
    if (temperature_avg < 5) return "Frost risk detected. Protect sensitive seedlings.";
    if (wind_speed > 20) return "High winds expected. Secure lightweight equipment and structures.";
    if (conditions?.toLowerCase().includes('rain')) return "Rain forecasted. Postpone nitrogen application to prevent leaching.";
    return "Favorable conditions for general field activities.";
};
