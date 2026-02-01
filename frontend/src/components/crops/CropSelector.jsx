import React, { useState, useEffect } from 'react';
import useCropStore from '../../store/cropStore';
import useFarmStore from '../../store/farmStore';
import useUIStore from '../../store/uiStore';

const CropSelector = () => {
    const { currentFarm } = useFarmStore();
    const { crops, fetchCropsByFarm } = useCropStore();
    const { showNotification } = useUIStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (currentFarm?.id) {
            fetchCropsByFarm(currentFarm.id);
        }
    }, [currentFarm?.id]);

    const filteredCrops = crops.filter(crop =>
        crop.crop_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.variety?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCrops = filteredCrops.filter(c => c.status !== 'archived').length;

    return (
        <div className="card animate-fade-in" style={{ padding: '0', border: '1px solid #000', borderRadius: '0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {/* Header: AgriXP Red Theme */}
            <div style={{ backgroundColor: '#bb1919', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    SELECT CROPS
                </h3>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '2px' }}>
                    {activeCrops} ACTIVE
                </span>
            </div>

            {/* Toolbar */}
            <div style={{ padding: '15px', backgroundColor: '#fcfcfc', borderBottom: '2px solid #000', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Refine crop list..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '2px solid #ddd',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}
                />
            </div>

            {/* List */}
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        {filteredCrops.map(crop => (
                            <tr key={crop.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px 15px', width: '40px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: crop.status === 'active' || crop.status === 'planted' ? '#e8f5e9' : '#fafafa',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px'
                                    }}>
                                        🥔
                                    </div>
                                </td>
                                <td style={{ padding: '12px 10px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#000', textTransform: 'uppercase' }}>{crop.crop_type}</div>
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{crop.variety}</div>
                                </td>
                                <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                                    {crop.status === 'planted' ? (
                                        <span style={{ fontSize: '10px', color: '#4caf50', fontWeight: '900', textTransform: 'uppercase' }}>PLANTED</span>
                                    ) : (
                                        <button
                                            style={{
                                                fontSize: '10px',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                padding: '4px 8px',
                                                backgroundColor: '#000',
                                                color: '#fff',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => showNotification(`Viewing ${crop.crop_type}`, 'info')}
                                        >
                                            SELECT
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredCrops.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '12px', fontWeight: '600' }}>
                                    No crops found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px', backgroundColor: '#f5f5f5', textAlign: 'center', borderTop: '1px solid #ddd' }}>
                <button style={{ color: '#bb1919', fontWeight: '800', background: 'transparent', border: 'none', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>
                    + ADD NEW VARIETY
                </button>
            </div>
        </div>
    );
};

export default CropSelector;
