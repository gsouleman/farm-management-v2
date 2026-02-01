import React, { useEffect } from 'react';
import useWeatherStore from '../../store/weatherStore';
import useFarmStore from '../../store/farmStore';

const WeatherWidget = () => {
    const { currentFarm } = useFarmStore();
    const { currentWeather, forecast, fetchWeather, loading } = useWeatherStore();

    useEffect(() => {
        if (currentFarm?.id) {
            fetchWeather(currentFarm.id);
        }
    }, [currentFarm?.id]);

    const getIcon = (condition) => {
        const c = condition?.toLowerCase() || '';
        if (c.includes('rain')) return '🌧️';
        if (c.includes('cloud')) return '☁️';
        if (c.includes('sun') || c.includes('clear')) return '☀️';
        if (c.includes('storm')) return '⚡';
        return '⛅';
    };

    if (loading) return (
        <div style={{ padding: '20px', border: '1px solid #000', textAlign: 'center', fontSize: '11px', fontWeight: '800', fontStyle: 'italic' }}>
            ESTABLISHING UPLINK...
        </div>
    );

    return (
        <div className="card animate-fade-in" style={{ padding: '0', border: '1px solid #000', borderRadius: '0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {/* Header: Live Telemetry Style */}
            <div style={{ backgroundColor: '#000', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        FARMING WEATHER
                    </h3>
                    <div style={{ fontSize: '9px', color: '#4caf50', marginTop: '2px', fontWeight: 'bold' }}>● LIVE FEED</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: '900' }}>
                        {currentWeather?.temp_c ? Math.round(currentWeather.temp_c) : '--'}°C
                    </div>
                </div>
            </div>

            {/* Main Display */}
            <div style={{ padding: '20px', background: 'linear-gradient(to bottom, #fcfcfc, #f4f4f4)', borderBottom: '2px solid #000' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '48px' }}>{getIcon(currentWeather?.condition?.text)}</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>
                            {currentWeather?.condition?.text || 'Unavailable'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', fontWeight: '600' }}>
                            HUMIDITY: {currentWeather?.humidity || 0}%  |  WIND: {currentWeather?.wind_kph || 0} km/h
                        </div>
                    </div>
                </div>
            </div>

            {/* Forecast Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {forecast.slice(0, 3).map((day, i) => (
                    <div key={i} style={{ padding: '10px', textAlign: 'center', borderRight: i < 2 ? '1px solid #ddd' : 'none' }}>
                        <div style={{ fontSize: '9px', fontWeight: '900', color: '#bb1919', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div style={{ fontSize: '16px' }}>{getIcon(day.day?.condition?.text)}</div>
                        <div style={{ fontSize: '11px', fontWeight: '800', marginTop: '4px' }}>
                            {Math.round(day.day?.maxtemp_c)}° / {Math.round(day.day?.mintemp_c)}°
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ backgroundColor: '#000', color: '#fff', padding: '8px', fontSize: '9px', textAlign: 'center', fontWeight: '600', letterSpacing: '1px' }}>
                PROBABILITY OF PRECIPITATION: {forecast[0]?.day?.daily_chance_of_rain || 0}%
            </div>
        </div>
    );
};

export default WeatherWidget;
