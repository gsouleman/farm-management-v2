import React, { useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useWeatherStore from '../store/weatherStore';
import { getSprayCondition, calculateGDD, getAIRecommendation } from '../utils/weatherHelpers';

const WeatherCenter = () => {
    const { currentFarm } = useFarmStore();
    const { weatherData, forecast, fetchWeather, fetchForecast, loading } = useWeatherStore();

    useEffect(() => {
        if (currentFarm) {
            fetchWeather(currentFarm.id);
            fetchForecast(currentFarm.id);
        }
    }, [currentFarm, fetchWeather, fetchForecast]);

    const spray = getSprayCondition(weatherData?.wind_speed || 0, weatherData?.precipitation || 0);
    const aiAdvice = getAIRecommendation(weatherData);

    return (
        <div className="animate-fade-in" style={{ padding: '24px', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
            {/* Header section with glassmorphism */}
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1a365d' }}>Farming Weather Dashboard</h1>
                    <p style={{ color: '#4a5568', fontSize: '15px' }}>Hyper-local agricultural intelligence for <strong>{currentFarm?.name}</strong></p>
                </div>
                <div style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#718096', fontWeight: 'bold', textTransform: 'uppercase' }}>UV INDEX</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e53e3e' }}>{weatherData?.uv_index || 'Moderate (4)'}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Main Condition Card (Glassmorphic) */}
                <div className="card" style={{
                    gridColumn: 'span 2',
                    padding: '40px',
                    background: 'linear-gradient(135deg, #2b6cb0 0%, #2d3748 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', opacity: 0.9, marginBottom: '8px' }}>NOW AT THE FIELD</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                            <div style={{ fontSize: '84px', fontWeight: '800', letterSpacing: '-2px' }}>{weatherData?.temperature_avg || '24'}°c</div>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: '600' }}>{weatherData?.conditions || 'Clear Sky'}</div>
                                <div style={{ fontSize: '16px', opacity: 0.8 }}>Feels like {Math.round((weatherData?.temperature_avg || 24) * 1.05)}°c</div>
                            </div>
                            <div style={{ fontSize: '100px', marginLeft: 'auto' }}>☀️</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '40px' }}>
                            {[
                                { label: 'Humidity', val: (weatherData?.humidity || '62') + '%', icon: '💧' },
                                { label: 'Wind Speed', val: (weatherData?.wind_speed || '14') + ' km/h', icon: '💨' },
                                { label: 'Pressure', val: (weatherData?.pressure || '1012') + ' hPa', icon: '⏲️' },
                                { label: 'Dew Point', val: (weatherData?.dew_point || '16') + ' °C', icon: '🌡️' }
                            ].map(m => (
                                <div key={m.label} style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>{m.icon}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: 'bold' }}>{m.label.toUpperCase()}</div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{m.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Spray Forecast Card */}
                <div className="card" style={{ borderRadius: '24px', padding: '30px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div className="flex a-center j-between" style={{ marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#2d3748' }}>Spray Window</h3>
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            backgroundColor: spray.color + '22',
                            color: spray.color
                        }}>{spray.status}</span>
                    </div>

                    <div style={{ textAlign: 'center', margin: '30px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>{spray.status === 'EXCELLENT' ? '🚜' : '🚩'}</div>
                        <p style={{ color: '#4a5568', fontSize: '14px', lineHeight: '1.6' }}>{spray.tip}</p>
                    </div>

                    <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <div className="flex j-between" style={{ fontSize: '12px', marginBottom: '5px' }}>
                                <span>Wind Suitability</span>
                                <span>{Math.max(0, 100 - (weatherData?.wind_speed || 0) * 5)}%</span>
                            </div>
                            <div style={{ height: '6px', backgroundColor: '#edf2f7', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.max(0, 100 - (weatherData?.wind_speed || 0) * 5)}%`, backgroundColor: spray.color }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex j-between" style={{ fontSize: '12px', marginBottom: '5px' }}>
                                <span>Rain Risk</span>
                                <span>{(weatherData?.precipitation > 0) ? 'High' : 'None'}</span>
                            </div>
                            <div style={{ height: '6px', backgroundColor: '#edf2f7', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: (weatherData?.precipitation > 0) ? '100%' : '5%', backgroundColor: (weatherData?.precipitation > 0) ? '#e53e3e' : '#27ae60' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                {/* 5-Day Agricultural Context */}
                <div className="card" style={{ borderRadius: '24px', border: 'none' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#2d3748' }}>Agricultural Forecast (5-Day)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                        {[1, 2, 3, 4, 5].map(day => (
                            <div key={day} style={{
                                textAlign: 'center',
                                padding: '20px 10px',
                                borderRadius: '20px',
                                backgroundColor: day === 1 ? '#ebf8ff' : '#f8f9fa',
                                border: day === 1 ? '1px solid #bee3f8' : '1px solid transparent'
                            }}>
                                <div style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', marginBottom: '10px' }}>
                                    {new Date(Date.now() + day * 86400000).toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{day % 2 === 0 ? '⛅' : '☀️'}</div>
                                <div style={{ fontWeight: '800', fontSize: '18px', color: '#2d3748' }}>29°</div>
                                <div style={{ fontSize: '12px', color: '#a0aec0' }}>21°</div>
                                <div style={{ marginTop: '15px', fontSize: '10px', color: '#2d3748', background: 'white', padding: '4px', borderRadius: '6px' }}>
                                    GDD: {calculateGDD(29, 21)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI & Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* AI Wisdom */}
                    <div className="card" style={{ borderRadius: '24px', background: '#fffaf0', border: '1px solid #feebc8' }}>
                        <div className="flex a-center" style={{ gap: '10px', marginBottom: '15px' }}>
                            <div style={{ backgroundColor: '#f6ad55', padding: '8px', borderRadius: '10px', fontSize: '20px' }}>🤖</div>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#7b341e' }}>Agronomy Advisor AI</h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#9c4221', lineHeight: '1.6', fontWeight: '500' }}>
                            "{aiAdvice}"
                        </p>
                    </div>

                    {/* Quick Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="card" style={{ borderRadius: '20px', border: 'none', background: 'white', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold' }}>SEASONAL GDD</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2f855a' }}>1,242</div>
                            <span style={{ fontSize: '10px', color: '#48bb78' }}>+12% vs avg</span>
                        </div>
                        <div className="card" style={{ borderRadius: '20px', border: 'none', background: 'white', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold' }}>CROP HEAT UNITS</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c05621' }}>2,850</div>
                            <span style={{ fontSize: '10px', color: '#718096' }}>Healthy pace</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherCenter;
