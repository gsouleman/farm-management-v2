import React from 'react';
import useFarmStore from '../store/farmStore';

const IoTIntegrations = () => {
    const { currentFarm } = useFarmStore();

    const sensors = [
        { id: 'SN-001', type: 'Soil Moisture', location: 'Field A', value: '42%', status: 'Online', battery: '85%' },
        { id: 'SN-002', type: 'Temperature/Humidity', location: 'Greenhouse 1', value: '24°C / 65%', status: 'Online', battery: '92%' },
        { id: 'SN-003', type: 'NPK Sensor', location: 'Field B', value: 'Optimal', status: 'Warning', battery: '12%' },
        { id: 'SN-004', type: 'Pest Drone', location: 'Charging Dock', value: 'Standby', status: 'Online', battery: '100%' },
    ];

    return (
        <div className="animate-fade-in" style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1a365d' }}>IoT Integrations</h1>
                    <p style={{ color: '#4a5568', fontSize: '15px' }}>Live sensor network for <strong>{currentFarm?.name || 'your farm'}</strong></p>
                </div>
                <button className="primary" style={{ backgroundColor: 'var(--primary)', padding: '10px 20px', borderRadius: '8px' }}>+ Connect Device</button>
            </div>

            {/* Live Dashboard Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <StatCard title="Active Sensors" value="12" sub="Across 4 Zones" icon="📡" color="#3182ce" />
                <StatCard title="Alerts" value="1" sub="Battery Critical (SN-003)" icon="⚠️" color="#e53e3e" />
                <StatCard title="Data Points" value="1,248" sub="Last 24 Hours" icon="📊" color="#38a169" />
                <StatCard title="Uptime" value="99.9%" sub="System Healthy" icon="⚡" color="#805ad5" />
            </div>

            {/* Device List */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #edf2f7', backgroundColor: '#fff' }}>
                    <h3 style={{ margin: 0, color: '#2d3748' }}>Connected Devices</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '16px 24px', color: '#718096', fontSize: '13px', fontWeight: '600' }}>ID</th>
                                <th style={{ padding: '16px 24px', color: '#718096', fontSize: '13px', fontWeight: '600' }}>Device Type</th>
                                <th style={{ padding: '16px 24px', color: '#718096', fontSize: '13px', fontWeight: '600' }}>Location</th>
                                <th style={{ padding: '16px 24px', color: '#718096', fontSize: '13px', fontWeight: '600' }}>Last Reading</th>
                                <th style={{ padding: '16px 24px', color: '#718096', fontSize: '13px', fontWeight: '600' }}>Battery</th>
                                <th style={{ padding: '16px 24px', color: '#718096', fontSize: '13px', fontWeight: '600' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sensors.map((sensor, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #edf2f7', backgroundColor: '#fff' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#2d3748' }}>{sensor.id}</td>
                                    <td style={{ padding: '16px 24px', color: '#4a5568' }}>{sensor.type}</td>
                                    <td style={{ padding: '16px 24px', color: '#4a5568' }}>{sensor.location}</td>
                                    <td style={{ padding: '16px 24px', color: '#2d3748', fontWeight: '500' }}>{sensor.value}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '40px', height: '6px', backgroundColor: '#edf2f7', borderRadius: '3px' }}>
                                                <div style={{ width: sensor.battery, height: '100%', backgroundColor: parseInt(sensor.battery) < 20 ? '#e53e3e' : '#38a169', borderRadius: '3px' }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#718096' }}>{sensor.battery}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            backgroundColor: sensor.status === 'Online' ? '#c6f6d5' : '#fed7d7',
                                            color: sensor.status === 'Online' ? '#22543d' : '#822727'
                                        }}>
                                            {sensor.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Insights Section */}
            <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: 'none' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Soil Moisture Trend</h3>
                    <div style={{ height: '200px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0' }}>
                        <span style={{ fontSize: '14px' }}>[ Moisture Level Line Chart Visualization ]</span>
                    </div>
                </div>
                <div className="card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: 'none' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Environmental Stats</h3>
                    <div style={{ height: '200px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0' }}>
                        <span style={{ fontSize: '14px' }}>[ Temp & Humidity Area Chart Visualization ]</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, sub, icon, color }) => (
    <div className="card hover-glow" style={{ padding: '20px', border: 'none', borderRadius: '16px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>{icon}</span>
            <span style={{ color: color, fontWeight: '800', fontSize: '12px', letterSpacing: '0.5px' }}>LIVE</span>
        </div>
        <div style={{ fontSize: '28px', fontWeight: '800', color: '#1a365d', marginBottom: '4px' }}>{value}</div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>{sub}</div>
    </div>
);

export default IoTIntegrations;
