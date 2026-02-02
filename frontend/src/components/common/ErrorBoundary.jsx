import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🔴 ERROR BOUNDARY CAUGHT:', error);
        console.error('🔴 ERROR INFO:', errorInfo);
        console.error('🔴 COMPONENT STACK:', errorInfo.componentStack);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1 style={{ color: 'red', marginBottom: '20px' }}>⚠️ Dashboard Crashed</h1>
                    <div style={{
                        backgroundColor: '#f5f5f5',
                        padding: '20px',
                        borderRadius: '8px',
                        textAlign: 'left',
                        maxWidth: '800px',
                        margin: '0 auto',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                    }}>
                        <p><strong>Error:</strong> {this.state.error?.toString()}</p>
                        <p><strong>Component Stack:</strong></p>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
