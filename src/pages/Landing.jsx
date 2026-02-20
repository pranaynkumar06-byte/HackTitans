/**
 * Landing.jsx
 * Premium anti-gravity landing page for AthleteAI.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } };

const MODULES = [
    { icon: '🏃', title: 'Speed & Agility', desc: 'Sprint timing and T-Test agility drills with live motion tracking', path: '/test/sprint' },
    { icon: '💪', title: 'Strength', desc: 'Push-ups and vertical jump analysis powered by pose detection', path: '/test/pushups' },
    { icon: '🫀', title: 'Endurance', desc: 'Beep test with VO2 max estimation and progressive difficulty', path: '/test/beep' },
    { icon: '🎯', title: 'Skill Accuracy', desc: 'Multi-sport target tracking for football, cricket, and basketball', path: '/test/target' },
    { icon: '🧠', title: 'Reaction Time', desc: 'Three interactive reflex games measuring millisecond precision', path: '/test/reaction' },
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
                minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '80px 24px 60px', position: 'relative',
            }}>
                <div className="animated-bg" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ maxWidth: '720px' }}>

                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 20px', borderRadius: '100px', fontSize: '0.72rem',
                        fontWeight: 600, marginBottom: '28px', letterSpacing: '0.04em',
                        background: 'rgba(129, 140, 248, 0.06)',
                        border: '1px solid rgba(129, 140, 248, 0.12)',
                        color: '#818cf8',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8' }} />
                        AI-Powered Sports Assessment
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800,
                        lineHeight: 1.08, marginBottom: '24px', letterSpacing: '-0.03em',
                    }}>
                        Discover Athletic{' '}
                        <span className="gradient-text">Potential</span>{' '}
                        with AI
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-secondary)',
                        maxWidth: '540px', margin: '0 auto 36px', lineHeight: 1.7,
                    }}>
                        Scientific assessments across 7 test modules, powered by real-time
                        pose detection — directly from your device.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => navigate('/select-test')}
                            style={{ padding: '16px 36px', fontSize: '0.95rem' }}>
                            Start Assessment
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/login')}
                            style={{ padding: '16px 36px', fontSize: '0.95rem' }}>
                            Sign In
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ═══ STATS BAR ═══ */}
            <section style={{
                display: 'flex', justifyContent: 'center', gap: '48px', padding: '32px 24px',
                flexWrap: 'wrap',
            }}>
                {STATS.map((s, i) => (
                    <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{s.value}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
                    </motion.div>
                ))}
            </section>

            {/* ═══ DIVIDER ═══ */}
            <div style={{ maxWidth: '200px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.15), transparent)', margin: '0 auto' }} />

            {/* ═══ 5 MODULES ═══ */}
            <section style={{ padding: '72px 24px', maxWidth: '1100px', margin: '0 auto' }}>
                <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Assessment <span className="gradient-text">Modules</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '12px', maxWidth: '500px', margin: '12px auto 0', lineHeight: 1.6 }}>
                        Comprehensive evaluation across speed, strength, endurance, skill, and reaction.
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                }}>
                    {MODULES.map((mod, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                            className="glass-card glass-card-hover"
                            onClick={() => navigate(mod.path)}
                            style={{
                                padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
                            }}>
                            <div style={{ fontSize: '2.8rem', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{mod.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{mod.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{mod.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section style={{ padding: '56px 24px', maxWidth: '1100px', margin: '0 auto' }}>
                <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Why <span className="gradient-text">AthleteAI</span>?
                    </h2>
                </motion.div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '16px',
                }}>
                    {FEATURES.map((feat, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.06 }}
                            className="glass-card glass-card-hover" style={{ padding: '28px' }}>
                            <div style={{ fontSize: '1.6rem', marginBottom: '14px' }}>{feat.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>{feat.title}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{feat.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section style={{ padding: '56px 24px', maxWidth: '720px', margin: '0 auto' }}>
                <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>How It <span className="gradient-text">Works</span></h2>
                </motion.div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { step: '01', title: 'Choose a test module', desc: 'Pick from 7 scientific assessments across 5 categories.' },
                        { step: '02', title: 'Perform the test', desc: 'Use your live camera for real-time AI analysis.' },
                        { step: '03', title: 'Get your scorecard', desc: 'Receive a weighted score, radar chart, and national ranking.' },
                        { step: '04', title: 'Track & compete', desc: 'Monitor progress, earn badges, and climb the leaderboard.' },
                    ].map((item, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                            className="glass-card" style={{ padding: '22px 28px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800,
                                background: 'rgba(129, 140, 248, 0.08)', color: '#818cf8', flexShrink: 0,
                                fontFamily: 'monospace', letterSpacing: '-0.02em',
                            }}>{item.step}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{item.title}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section style={{ padding: '72px 24px', textAlign: 'center' }}>
                <motion.div {...fadeUp} className="glass-card" style={{
                    maxWidth: '640px', margin: '0 auto', padding: '56px 40px',
                    boxShadow: 'var(--shadow-float)',
                }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em' }}>
                        Ready to discover your <span className="gradient-text">potential</span>?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
                        Join thousands of athletes being evaluated by AI across India.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => navigate('/select-test')}
                            style={{ padding: '16px 36px', fontSize: '0.95rem' }}>Start Your Assessment</button>
                        <button className="btn-secondary" onClick={() => navigate('/dashboard')}
                            style={{ padding: '16px 36px', fontSize: '0.95rem' }}>View Dashboard</button>
                    </div>
                </motion.div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{
                padding: '32px 24px', textAlign: 'center',
                fontSize: '0.78rem', color: 'var(--text-muted)',
            }}>
                <div style={{ maxWidth: '400px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(148,163,184,0.08), transparent)', margin: '0 auto 24px' }} />
                <p>AthleteAI · AI-Powered Multi-Sport Assessment Platform</p>
                <p style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                    Built for India · Low-bandwidth compatible · 100% Free
                </p>
            </footer>
        </div>
    );
}
