/**
 * Layout.jsx
 * Shared layout with collapsible sidebar navigation across all pages.
 * Mobile-first with hamburger menu toggle.
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isOnline } from '../services/syncService';

const NAV_SECTIONS = [
    {
        label: 'Main',
        items: [
            { path: '/', icon: '🏠', label: 'Home' },
            { path: '/dashboard', icon: '📊', label: 'Dashboard' },
            { path: '/coach', icon: '👨‍🏫', label: 'Coach Panel' },
        ],
    },
    {
        label: 'Speed & Agility',
        items: [
            { path: '/test/sprint', icon: '🏃', label: 'Sprint Test' },
            { path: '/test/t-test', icon: '⚡', label: 'T-Test Drill' },
        ],
    },
    {
        label: 'Strength',
        items: [
            { path: '/test/pushups', icon: '💪', label: 'Push-Up Test' },
            { path: '/test/vertical-jump', icon: '🦘', label: 'Vertical Jump' },
        ],
    },
    {
        label: 'Endurance',
        items: [
            { path: '/test/beep', icon: '🫀', label: 'Beep Test' },
        ],
    },
    {
        label: 'Skills & Reaction',
        items: [
            { path: '/test/target', icon: '🎯', label: 'Target Accuracy' },
            { path: '/test/reaction', icon: '🧠', label: 'Reaction Time' },
        ],
    },
    {
        label: 'Legacy',
        items: [
            { path: '/assessment', icon: '📹', label: 'Camera Assessment' },
        ],
    },
];

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const online = isOnline();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy-darkest)' }}>
            <div className="animated-bg" />

            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                            zIndex: 90, display: 'none',
                        }}
                        className="sidebar-overlay"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                style={{
                    width: sidebarOpen ? '260px' : '0px',
                    minWidth: sidebarOpen ? '260px' : '0px',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    background: 'rgba(10, 14, 39, 0.95)',
                    borderRight: sidebarOpen ? '1px solid var(--glass-border)' : 'none',
                    backdropFilter: 'blur(20px)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    transition: 'all 0.3s ease',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {sidebarOpen && (
                    <>
                        {/* Brand */}
                        <div style={{
                            padding: '20px 18px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                            }} onClick={() => { navigate('/'); setSidebarOpen(false); }}>
                                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                                <span className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 800 }}>AthleteAI</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', fontSize: '1.2rem', padding: '4px',
                            }}>✕</button>
                        </div>

                        {/* Nav Sections */}
                        <nav style={{ padding: '12px 0', flex: 1 }}>
                            {NAV_SECTIONS.map((section) => (
                                <div key={section.label} style={{ marginBottom: '8px' }}>
                                    <div style={{
                                        padding: '6px 18px', fontSize: '0.65rem', fontWeight: 700,
                                        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px',
                                    }}>
                                        {section.label}
                                    </div>
                                    {section.items.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            style={({ isActive }) => ({
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '10px 18px', marginInline: '8px', borderRadius: '10px',
                                                textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600,
                                                color: isActive ? 'var(--neon-green)' : 'var(--text-secondary)',
                                                background: isActive ? 'rgba(57, 255, 20, 0.08)' : 'transparent',
                                                transition: 'all 0.2s ease',
                                            })}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                            {item.label}
                                        </NavLink>
                                    ))}
                                </div>
                            ))}
                        </nav>

                        {/* Status */}
                        <div style={{
                            padding: '16px 18px', borderTop: '1px solid var(--glass-border)',
                            fontSize: '0.75rem',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                color: online ? 'var(--neon-green)' : 'var(--danger-red)',
                            }}>
                                <span style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: online ? 'var(--neon-green)' : 'var(--danger-red)',
                                }} />
                                {online ? 'Online' : 'Offline Mode'}
                            </div>
                        </div>
                    </>
                )}
            </aside>

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top bar */}
                <header style={{
                    padding: '12px 20px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    borderBottom: '1px solid var(--glass-border)',
                    background: 'rgba(5, 8, 22, 0.8)',
                    backdropFilter: 'blur(20px)',
                    position: 'sticky', top: 0, zIndex: 50,
                }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                        background: 'none', border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem',
                        padding: '6px 10px', borderRadius: '8px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        ☰
                    </button>
                    <span className="gradient-text" style={{ fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/')}>AthleteAI</span>
                    <div style={{ flex: 1 }} />
                    {!online && <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>📴 Offline</span>}
                    <button className="btn-secondary" onClick={() => navigate('/coach')}
                        style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '8px' }}>
                        👨‍🏫 Coach
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}
                        style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '8px' }}>
                        Dashboard
                    </button>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </main>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
          aside { position: fixed !important; }
        }
      `}</style>
        </div>
    );
}
