import React from 'react';
import useFarmStore from '../store/farmStore';

const AdvancedFeatures = () => {
    const { currentFarm } = useFarmStore();

    const features = [
        { title: 'Advanced Analytics', icon: '📊', desc: 'Deep dive into yield trends, financial forecasting, and soil health metrics.', status: 'Coming Soon' },
        { title: 'IoT Integrations', icon: '📡', desc: 'Connect sensors, drones, and automated irrigation systems.', status: 'Beta' },
        { title: 'Market Access', icon: '🌍', desc: 'Direct connection to buyers, commodity prices, and logistics partners.', status: 'Planned' },
        { title: 'Compliance & Audits', icon: '✅', desc: 'Automated report generation for organic certification and GAP audits.', status: 'Coming Soon' }
    ];

    return (
        <div className="animate-fade-in" style={{ padding: '24px', minHeight: '100vh' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1a365d' }}>Advanced Features</h1>
                    <p style={{ color: '#4a5568', fontSize: '15px' }}>Next-generation tools for <strong>{currentFarm?.name || 'your farm'}</strong></p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {features.map((feat, idx) => (
                    <div key={idx} className="card hover-glow" style={{ padding: '30px', border: 'none', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                backgroundColor: feat.status === 'Beta' ? '#f6ad55' : '#cbd5e0',
                                color: feat.status === 'Beta' ? 'white' : '#4a5568'
                            }}>
                                {feat.status}
                            </span>
                        </div>
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}>{feat.icon}</div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#2d3748' }}>{feat.title}</h3>
                        <p style={{ color: '#718096', lineHeight: '1.6' }}>{feat.desc}</p>

                        <div style={{ marginTop: '24px' }}>
                            <button className="outline" disabled={feat.status !== 'Beta'} style={{ width: '100%', opacity: feat.status !== 'Beta' ? 0.5 : 1 }}>
                                {feat.status === 'Beta' ? 'Manage Settings' : 'Notify Me'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '40px', padding: '30px', backgroundColor: '#ebf8ff', borderRadius: '20px', border: '1px solid #bee3f8' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2b6cb0' }}>🚀 Request a Feature</h3>
                <p style={{ color: '#2c5282', marginBottom: '20px' }}>Don't see what you need? We are constantly building new tools for modern farming.</p>
                <button className="primary" style={{ backgroundColor: '#3182ce' }}>Submit Request</button>
            </div>
        </div>
    );
};

export default AdvancedFeatures;
