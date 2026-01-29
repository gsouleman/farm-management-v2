import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: ''
    });
    const { register, loading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await register(formData);
        if (useAuthStore.getState().isAuthenticated) {
            navigate('/');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-main)',
            padding: '40px 0'
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '8px' }}>FARMER PRO</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Join AgriXP to start tracking your farm data</p>
                </div>

                {error && <div style={{ color: 'var(--error)', marginBottom: '20px', textAlign: 'center', fontSize: '14px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="At least 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Continue to Dashboard'}
                    </button>
                </form>

                <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Sign In here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
