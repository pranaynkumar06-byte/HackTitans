/**
 * AuthPage.jsx
 * Login & Sign-up for User and Coach, with Google sign-in option.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // login, signup
    const [role, setRole] = useState('user'); // user, coach
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    }

    function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!form.email || !form.password) {
            setError('Please fill in all required fields.');
            return;
        }
        if (mode === 'signup' && form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (mode === 'signup' && !form.name) {
            setError('Please enter your name.');
            return;
        }

        setLoading(true);
        // Simulate auth
        setTimeout(() => {
            setLoading(false);
            localStorage.setItem('athleteai_user', JSON.stringify({
                name: form.name || form.email.split('@')[0],
                email: form.email,
                role,
                loggedIn: true,
            }));
            navigate(role === 'coach' ? '/coach' : '/dashboard');
        }, 1200);
    }

    function handleGoogleLogin() {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            localStorage.setItem('athleteai_user', JSON.stringify({
                name: 'Google User',
                email: 'user@gmail.com',
                role,
                loggedIn: true,
            }));
            navigate(role === 'coach' ? '/coach' : '/dashboard');
        }, 1000);
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card"
                style={{ maxWidth: '420px', width: '100%', padding: '36px 32px', background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            >
                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div
                        className="gradient-text"
                        style={{ fontSize: '1.6rem', fontWeight: 800, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        AthleteAI
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                    </p>
                </div>

                {/* Role Toggle */}
                <div style={{
                    display: 'flex', borderRadius: '10px', overflow: 'hidden',
                    border: '1px solid var(--glass-border)', marginBottom: '24px',
                }}>
                    {['user', 'coach'].map(r => (
                        <button key={r}
                            onClick={() => setRole(r)}
                            style={{
                                flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                                background: role === r ? 'var(--neon-green)' : 'var(--glass-bg)',
                                color: role === r ? '#fff' : 'var(--text-muted)',
                            }}
                        >
                            {r === 'user' ? '🏃 Athlete' : '👨‍🏫 Coach'}
                        </button>
                    ))}
                </div>

                {/* Google Button */}
                <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}
                    style={{ marginBottom: '20px', opacity: loading ? 0.6 : 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Continue with Google
                </button>

                {/* Divider */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mode === 'signup' && (
                        <input className="auth-input" type="text" name="name" placeholder="Full Name"
                            value={form.name} onChange={handleChange} />
                    )}
                    <input className="auth-input" type="email" name="email" placeholder="Email address"
                        value={form.email} onChange={handleChange} />
                    <input className="auth-input" type="password" name="password" placeholder="Password"
                        value={form.password} onChange={handleChange} />
                    {mode === 'signup' && (
                        <input className="auth-input" type="password" name="confirmPassword"
                            placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
                    )}

                    {error && (
                        <div style={{
                            padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem',
                            background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger-red)',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                        }}>{error}</div>
                    )}

                    <button className="btn-primary" type="submit" disabled={loading}
                        style={{ width: '100%', padding: '14px', opacity: loading ? 0.6 : 1, marginTop: '4px' }}>
                        {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {/* Toggle mode */}
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    </span>
                    <span
                        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                        style={{ color: 'var(--neon-green)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
