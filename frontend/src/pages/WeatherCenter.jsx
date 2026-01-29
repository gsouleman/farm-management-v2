import React, { useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useWeatherStore from '../store/weatherStore';

const WeatherCenter = () => {
    const { currentFarm } = useFarmStore();
    const { weatherData, forecast, fetchWeather, fetchForecast, loading } = useWeatherStore();

    useEffect(() => {
        if (currentFarm) {
            fetchWeather(currentFarm.id);
            fetchForecast(currentFarm.id);
        }
    }, [currentFarm, fetchWeather, fetchForecast]);

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', margin: 0 }}>Meteorological Center</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Hyper-local weather data for {currentFarm?.name}.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                {/* Current Conditions */}
                <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)', color: 'white', border: 'none' }}>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>CURRENT CONDITIONS</div>
                    <div style={{ fontSize: '64px', fontWeight: 'bold' }}>{weatherData?.temperature_avg || '24'}°C</div>
                    <div style={{ fontSize: '20px', marginBottom: '30px' }}>{weatherData?.conditions || 'Partly Cloudy'}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                        <div className="card" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px' }}>
                            <div>Humidity</div>
                            <div style={{ fontWeight: 'bold' }}>{weatherData?.humidity || '65'}%</div>
                        </div>
                        <div className="card" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px' }}>
                            <div>Wind</div>
                            <div style={{ fontWeight: 'bold' }}>{weatherData?.wind_speed || '12'} km/h</div>
                        </div>
                    </div>
                </div>

                {/* 5-Day Forecast */}
                <div className="card">
                    <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>5-Day Agricultural Forecast</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {[1, 2, 3, 4, 5].map(day => (
                            <div key={day} style={{ textAlign: 'center', padding: '16px', borderRadius: '12px', backgroundColor: '#f8f9fa', width: '18%' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Day {day}</div>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⛅</div>
                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>28° / 22°</div>
                                <div style={{ fontSize: '10px', color: 'var(--primary)', marginTop: '4px' }}>0.0mm Rain</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weather Alerts & History */}
            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Agricultural Weather Log (Last 7 Days)</h3>
                <div className="card" style={{ padding: 0, border: 'none', backgroundColor: '#fcfdfc' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '12px' }}>Date</th>
                                <th style={{ padding: '12px' }}>Max Temp</th>
                                <th style={{ padding: '12px' }}>Min Temp</th>
                                <th style={{ padding: '12px' }}>Precipitation</th>
                                <th style={{ padding: '12px' }}>Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ fontSize: '13px', borderBottom: '1px solid #f9f9f9' }}>
                                <td style={{ padding: '12px' }}>2026-01-28</td>
                                <td style={{ padding: '12px' }}>29°C</td>
                                <td style={{ padding: '12px' }}>21°C</td>
                                <td style={{ padding: '12px' }}>2.5mm</td>
                                <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#eee', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>OpenWeather</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WeatherCenter;
