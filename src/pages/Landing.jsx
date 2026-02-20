/**
 * Landing.jsx
 * Landing page with hero, 5-module showcase, features, stats, and CTA.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const MODULES = [
    { icon: '🏃', title: 'Speed & Agility', desc: 'Sprint timing, T-Test agility drills', path: '/test/sprint', color: '#39ff14' },
    { icon: '💪', title: 'Strength', desc: 'Push-ups, Vertical Jump analysis', path: '/test/pushups', color: '#00d4ff' },
    { icon: '🫀', title: 'Endurance', desc: 'Beep Test with VO2 max estimation', path: '/test/beep', color: '#a855f7' },
    { icon: '🎯', title: 'Skill Accuracy', desc: 'Multi-sport target drills', path: '/test/target', color: '#fbbf24' },
    { icon: '🧠', title: 'Reaction Time', desc: 'Interactive reflex games', path: '/test/reaction', color: '#ff3b5c' },
];

const FEATURES = [
    { icon: '📹', title: 'AI Video Analysis', desc: 'MediaPipe Pose detection with 33 body landmarks at 30 FPS.' },
    { icon: '🛡️', title: 'Cheat Detection', desc: 'Metadata validation, pattern analysis, and anomaly flagging.' },
    { icon: '📊', title: 'Radar Scoring', desc: '5-axis weighted scoring with radar charts and trend graphs.' },
    { icon: '👨‍🏫', title: 'Coach Dashboard', desc: 'Monitor athletes, compare metrics, generate PDF reports.' },
    { icon: '📴', title: 'Offline Mode', desc: 'Works without internet. Auto-syncs when connection returns.' },
    { icon: '🏆', title: 'Gamification', desc: 'XP, levels, badges, and national leaderboard rankings.' },
];

const STATS = [
    { value: '7', label: 'Test Modules' },
    { value: '33', label: 'Body Landmarks' },
    { value: '5', label: 'Sport Categories' },
    { value: '100%', label: 'Free Access' },
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div style={{ overflow: 'hidden' }}>
            {/* ═══ HERO ═══ */}
            <section style={{
                minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '60px 20px 40px', position: 'relative',
            }}>
                <div className="animated-bg" />
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    style={{ maxWidth: '800px' }}>
                    <div style={{
                        display: 'inline-block', padding: '6px 18px', borderRadius: '20px', fontSize: '0.75rem',
                        fontWeight: 700, marginBottom: '20px', letterSpacing: '1px',
                        background: 'rgba(57, 255, 20, 0.1)', border: '1px solid rgba(57, 255, 20, 0.3)',
                        color: 'var(--neon-green)',
                    }}>
                        🏅 MULTI-SPORT AI ASSESSMENT PLATFORM
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '18px' }}>
                        AI-Powered Sports Talent{' '}
                        <span className="gradient-text">Identification for Every Athlete</span>{' '}
                        in India
                    </h1>
                    <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                        7 test modules. 5 sport categories. One unified platform.
                        Scientific assessments powered by AI pose detection — directly from your smartphone.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-secondary" onClick={() => navigate('/login')}
                            style={{ padding: '14px 32px', fontSize: '1rem' }}>
                            🔐 Login / Sign Up
                        </button>
                        <button className="btn-primary" onClick={() => navigate('/select-test')}
                            style={{ padding: '14px 32px', fontSize: '1rem' }}>
                            🚀 Start Testing
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ═══ STATS BAR ═══ */}
            <section style={{
                display: 'flex', justifyContent: 'center', gap: '40px', padding: '24px 20px',
                flexWrap: 'wrap', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)',
            }}>
                {STATS.map((s, i) => (
                    <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} style={{ textAlign: 'center' }}>
                        <div className="gradient-text" style={{ fontSize: '2rem', fontWeight: 900 }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                    </motion.div>
                ))}
            </section>

            {/* ═══ 5 MODULES ═══ */}
            <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' }}>
                <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
                        <span className="gradient-text">5 Assessment Modules</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Comprehensive evaluation across speed, strength, endurance, skill, and reaction.
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                }}>
                    {MODULES.map((mod, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                            className="glass-card glass-card-hover"
                            onClick={() => navigate(mod.path)}
                            style={{
                                padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                                borderTop: `3px solid ${mod.color}`,
                            }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{mod.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{mod.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{mod.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section style={{ padding: '50px 20px', maxWidth: '1100px', margin: '0 auto' }}>
                <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                        Why <span className="gradient-text">AthleteAI</span>?
                    </h2>
                </motion.div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                }}>
                    {FEATURES.map((feat, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                            className="glass-card glass-card-hover" style={{ padding: '24px' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{feat.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>{feat.title}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feat.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section style={{ padding: '50px 20px', maxWidth: '800px', margin: '0 auto' }}>
                <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>How It <span className="gradient-text">Works</span></h2>
                </motion.div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { step: '1', title: 'Choose a test module', desc: 'Pick from 7 scientific assessments across 5 categories.' },
                        { step: '2', title: 'Perform the test', desc: 'Use your live camera for real-time AI analysis.' },
                        { step: '3', title: 'Get your scorecard', desc: 'Receive a weighted score, radar chart, and national ranking.' },
                        { step: '4', title: 'Track & compete', desc: 'Monitor progress, earn badges, and climb the leaderboard.' },
                    ].map((item, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                            className="glass-card" style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800,
                                background: 'rgba(57, 255, 20, 0.1)', color: 'var(--neon-green)', flexShrink: 0,
                            }}>{item.step}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section style={{ padding: '60px 20px', textAlign: 'center' }}>
                <motion.div {...fadeUp} className="glass-card" style={{
                    maxWidth: '700px', margin: '0 auto', padding: '48px 32px',
                    border: '1px solid rgba(57, 255, 20, 0.2)',
                }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>
                        Ready to discover your <span className="gradient-text">athletic potential</span>?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Join thousands of athletes being evaluated by AI across India.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => navigate('/select-test')}
                            style={{ padding: '14px 32px', fontSize: '1rem' }}>🚀 Start Your Assessment</button>
                        <button className="btn-secondary" onClick={() => navigate('/dashboard')}
                            style={{ padding: '14px 32px', fontSize: '1rem' }}>📊 View Dashboard</button>
                    </div>
                </motion.div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{
                padding: '24px 20px', borderTop: '1px solid var(--glass-border)',
                textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)',
            }}>
                <p>⚡ AthleteAI • AI-Powered Multi-Sport Assessment Platform • Government of India Initiative</p>
                <p style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                    Built for 🇮🇳 India • Low-bandwidth compatible • 100% Free
                </p>
            </footer>
        </div>
    );
}
