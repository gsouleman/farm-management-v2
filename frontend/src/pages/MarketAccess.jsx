import React from 'react';
import useFarmStore from '../store/farmStore';

const MarketAccess = () => {
    const { currentFarm } = useFarmStore();

    const prices = [
        { commodity: 'Wheat', price: '$224.50', unit: 'ton', change: '+2.4%', trend: 'up' },
        { commodity: 'Corn', price: '$186.20', unit: 'ton', change: '-1.2%', trend: 'down' },
        { commodity: 'Soybeans', price: '$492.00', unit: 'ton', change: '+0.8%', trend: 'up' },
        { commodity: 'Canola', price: '$612.40', unit: 'ton', change: '+3.1%', trend: 'up' },
    ];

    const buyers = [
        { name: 'Global Grains Ltd.', distance: '12 km', rating: '4.9/5', interestedIn: ['Wheat', 'Corn'] },
        { name: 'EcoFoods Organic', distance: '45 km', rating: '4.7/5', interestedIn: ['Soybeans'] },
        { name: 'Central Miller Co.', distance: '8 km', rating: '4.5/5', interestedIn: ['Wheat', 'Canola'] },
    ];

    return (
        <div className="animate-fade-in" style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f7fafc' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1a365d' }}>Market Access</h1>
                    <p style={{ color: '#4a5568', fontSize: '15px' }}>Global commodities & buyer network for <strong>{currentFarm?.name || 'your farm'}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="outline" style={{ padding: '10px 20px', borderRadius: '8px' }}>Logistics Tracker</button>
                    <button className="primary" style={{ backgroundColor: '#2b6cb0', padding: '10px 20px', borderRadius: '8px' }}>List Harvest</button>
                </div>
            </div>

            {/* Commodity Prices Bar */}
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '32px' }}>
                {prices.map((p, idx) => (
                    <div key={idx} className="card" style={{ minWidth: '220px', padding: '20px', border: 'none', borderRadius: '16px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '700', color: '#4a5568' }}>{p.commodity}</span>
                            <span style={{ fontSize: '12px', color: p.trend === 'up' ? '#38a169' : '#e53e3e', fontWeight: '800' }}>{p.change}</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#2d3748' }}>{p.price}</div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>per {p.unit}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '32px' }}>
                {/* Main Content: Marketplace */}
                <div>
                    <div className="card" style={{ padding: '24px', borderRadius: '20px', border: 'none', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: '#2d3748' }}>Active Buy Orders</h3>
                            <div style={{ fontSize: '14px', color: '#3182ce', cursor: 'pointer', fontWeight: '600' }}>View Global Map →</div>
                        </div>

                        {buyers.map((buyer, idx) => (
                            <div key={idx} style={{ padding: '20px', border: '1px solid #edf2f7', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#ebf8ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏢</div>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#2d3748' }}>{buyer.name}</div>
                                        <div style={{ fontSize: '13px', color: '#718096' }}>{buyer.distance} away • ⭐ {buyer.rating}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        {buyer.interestedIn.map((item, i) => (
                                            <span key={i} style={{ padding: '2px 8px', backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px', color: '#4a5568' }}>{item}</span>
                                        ))}
                                    </div>
                                    <button className="primary" style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', backgroundColor: '#2b6cb0' }}>Negotiate</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Market Insights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px', borderRadius: '20px', border: 'none', backgroundColor: '#1a365d', color: 'white' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Market Sentiment</h3>
                        <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6', marginBottom: '20px' }}>
                            Wheat prices are trending upwards due to lower seasonal yields in the northern hemisphere. Consider holding stock for another 2 weeks.
                        </p>
                        <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px' }}>RECOMMENDATION</div>
                            <div style={{ fontWeight: '700', color: '#63b3ed' }}>BULLISH ON WHEAT</div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px', borderRadius: '20px', border: 'none', backgroundColor: '#fff' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#2d3748', fontSize: '18px' }}>Price Forecast</h3>
                        <div style={{ height: '150px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0' }}>
                            <span style={{ fontSize: '13px' }}>[ Interactive Forecast Chart ]</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketAccess;
