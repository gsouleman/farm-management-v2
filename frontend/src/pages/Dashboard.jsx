import React from 'react';

// MINIMAL TEST DASHBOARD - TEMPORARY
// This tests if crash is in Dashboard or elsewhere
const Dashboard = () => {
    console.log('[MINIMAL DASHBOARD] Rendering...');
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>🧪 MINIMAL TEST DASHBOARD</h1>
            <p>If you see this, Dashboard is NOT the problem.</p>
            <p>The issue is in a parent component or store.</p>
        </div>
    );
};

export default Dashboard;
