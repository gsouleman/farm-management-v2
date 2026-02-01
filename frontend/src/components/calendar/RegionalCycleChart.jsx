import React from 'react';

const RegionalCycleChart = ({ data, category }) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Helper to parse window string into months
    // Example: "Mar - Jun / Aug - Nov" -> [[2, 5], [7, 10]] (0-indexed)
    const parseWindows = (windowStr) => {
        if (!windowStr) return [];
        if (windowStr.toLowerCase().includes('year-round')) return [[0, 11]];

        // Simple parser for standard "Mon - Mon" format
        // This is a basic implementation and might need refinement for complex strings
        const ranges = [];
        const parts = windowStr.split('/');

        parts.forEach(part => {
            const [start, end] = part.trim().split('-').map(s => s.trim());
            if (start && end) {
                const startIdx = months.findIndex(m => start.startsWith(m));
                const endIdx = months.findIndex(m => end.startsWith(m));
                if (startIdx !== -1 && endIdx !== -1) {
                    if (endIdx < startIdx) {
                        // Cross-year (e.g. Nov - Mar) -> Nov-Dec + Jan-Mar
                        ranges.push([startIdx, 11]);
                        ranges.push([0, endIdx]);
                    } else {
                        ranges.push([startIdx, endIdx]);
                    }
                }
            } else if (start) {
                // Single month or special case
                const idx = months.findIndex(m => start.startsWith(m));
                if (idx !== -1) ranges.push([idx, idx]);
            }
        });

        return ranges;
    };

    return (
        <div className="card" style={{ padding: '24px', borderRadius: '16px', marginTop: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#2d3748' }}>{category} Growth Cycles (2026)</h3>

            <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: '600px' }}>
                    {/* Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(12, 1fr)', gap: '4px', marginBottom: '12px' }}>
                        <div style={{ fontWeight: 'bold', color: '#718096', fontSize: '12px' }}>CROP</div>
                        {months.map(m => (
                            <div key={m} style={{ textAlign: 'center', fontWeight: 'bold', color: '#cbd5e0', fontSize: '11px' }}>{m}</div>
                        ))}
                    </div>

                    {/* Rows */}
                    {data.map((crop, idx) => {
                        const ranges = parseWindows(crop.window);
                        return (
                            <div key={idx} style={{
                                display: 'grid',
                                gridTemplateColumns: '150px repeat(12, 1fr)',
                                gap: '4px',
                                marginBottom: '8px',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid #f7fafc'
                            }}>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>{crop.crop}</div>
                                {months.map((_, mIdx) => {
                                    const isActive = ranges.some(range => mIdx >= range[0] && mIdx <= range[1]);
                                    return (
                                        <div key={mIdx} style={{ height: '24px', position: 'relative' }}>
                                            {isActive && (
                                                <div
                                                    className="animate-slide-in"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '4px',
                                                        bottom: '4px',
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: 'var(--primary)',
                                                        borderRadius: '4px',
                                                        opacity: 0.8
                                                    }}
                                                    title={`${crop.crop}: Active in ${months[mIdx]}`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '20px', fontSize: '12px', color: '#718096' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--primary)', borderRadius: '3px', opacity: 0.8 }}></div>
                    <span>Optimal Planting & Growth Window</span>
                </div>
                {/* Future: Add Harvest / Prep colors */}
            </div>
        </div>
    );
};

export default RegionalCycleChart;
