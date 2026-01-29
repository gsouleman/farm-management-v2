import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const { login, loading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(credentials);
        if (useAuthStore.getState().isAuthenticated) {
            navigate('/');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'var(--bg-main)'
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '8px' }}>FARMER PRO</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in to manage your farm operations</p>
                </div>

                {error && <div style={{ color: 'var(--error)', marginBottom: '20px', textAlign: 'center', fontSize: '14px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <div className="flex j-between a-center" style={{ marginBottom: '6px' }}>
                            <label style={{ margin: 0 }}>Password</label>
                            <Link to="#" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Create account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
