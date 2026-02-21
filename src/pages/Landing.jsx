/**
 * Landing.jsx — Premium light-mode SaaS landing page
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const MODULES = [
    { icon: '🏃', title: 'Speed & Agility', sub: 'Sprint · T-Test Agility', desc: 'AI-tracked sprint timing and lateral agility drills with real-time motion analysis.' },
    { icon: '💪', title: 'Strength', sub: 'Push-Ups · Vertical Jump', desc: 'Automated rep counting, form accuracy scoring, and explosive power measurement.' },
    { icon: '🫀', title: 'Endurance', sub: 'Beep Test · VO2 Max', desc: 'Progressive shuttle run protocol with live VO2 max estimation and fatigue tracking.' },
    { icon: '🎯', title: 'Precision', sub: 'Target Accuracy', desc: 'Multi-sport accuracy tracking across football, cricket, and basketball disciplines.' },
    { icon: '🧠', title: 'Reaction', sub: 'Reflex Games', desc: 'Three interactive reaction speed tests measuring millisecond-level response time.' },
];

const FEATURES = [
    { title: 'Pose Detection', desc: '33 body landmarks tracked at 30 FPS using MediaPipe for precise biomechanical analysis.', stat: '33', unit: 'landmarks' },
    { title: 'Cheat Detection', desc: 'Automated validation for camera angles, video edits, multi-person detection, and form accuracy.', stat: '6', unit: 'checks' },
    { title: 'Scoring Engine', desc: '5-axis weighted radar scoring with national percentile rankings and trend visualization.', stat: '5', unit: 'axes' },
    { title: 'Coach Tools', desc: 'Compare athletes, track progress over time, and generate detailed PDF assessment reports.', stat: '∞', unit: 'reports' },
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div>
            {/* ═══ HERO ═══ */}
            <section style={{
                minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '100px 24px 80px', position: 'relative',
            }}>
                <div className="animated-bg" />
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ maxWidth: '680px' }}>

                    {/* Pill badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 18px', borderRadius: '100px', fontSize: '0.72rem',
                        fontWeight: 600, marginBottom: '32px', letterSpacing: '0.03em',
                        background: 'rgba(13, 148, 136, 0.06)',
                        border: '1px solid rgba(13, 148, 136, 0.12)',
                        color: '#0d9488',
                    }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0d9488' }} />
                        AI-Powered Sports Assessment
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', fontWeight: 800,
                        lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.04em',
                        color: '#1a1a1a',
                    }}>
                        Measure every{' '}
                        <span className="gradient-text">athlete's</span>{' '}
                        potential
                    </h1>

                    {/* Subtext */}
                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-secondary)',
                        maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7,
                        letterSpacing: '-0.01em',
                    }}>
                        7 scientific test modules. Real-time pose detection.
                        Instant scorecards — all from a smartphone camera.
                    </p>

                    {/* CTA buttons */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => navigate('/select-test')}
                            style={{ padding: '15px 36px', fontSize: '0.92rem' }}>
                            Start Assessment
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/login')}
                            style={{ padding: '15px 36px', fontSize: '0.92rem' }}>
                            Sign In
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ═══ STATS STRIP — liquid glass ═══ */}
            <section style={{
                padding: '40px 24px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--glass-border)',
                borderBottom: '1px solid var(--glass-border)',
            }}>
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '64px',
                    flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto',
                }}>
                    {[
                        { value: '7', label: 'Test Modules' },
                        { value: '33', label: 'Body Landmarks' },
                        { value: '5', label: 'Sport Categories' },
                        { value: '30', label: 'FPS Tracking' },
                    ].map((s, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.06 }}
                            style={{ textAlign: 'center', minWidth: '100px' }}>
                            <div className="gradient-text-static" style={{
                                fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em',
                            }}>{s.value}</div>
                            <div style={{
                                fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600,
                                letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '6px',
                            }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ MODULES ═══ */}
            <section style={{ padding: '96px 24px', maxWidth: '1100px', margin: '0 auto' }}>
                <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <p style={{
                        fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)',
                        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px',
                    }}>Assessment Modules</p>
                    <h2 style={{
                        fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800,
                        letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text-primary)',
                    }}>
                        Five dimensions of<br />athletic performance
                    </h2>
                </motion.div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                }}>
                    {MODULES.map((mod, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.06 }}
                            className="glass-card glass-card-hover liquid-glass-panel-animate"
                            onClick={() => navigate('/select-test')}
                            style={{ padding: '32px 24px', cursor: 'pointer' }}>
                            <div style={{ fontSize: '2.2rem', marginBottom: '20px' }}>{mod.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{mod.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '12px', letterSpacing: '0.01em' }}>{mod.sub}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{mod.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ FEATURES — liquid glass ═══ */}
            <section style={{ padding: '96px 24px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <p style={{
                            fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)',
                            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px',
                        }}>Technology</p>
                        <h2 style={{
                            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800,
                            letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text-primary)',
                        }}>
                            Built for accuracy<br />and reliability
                        </h2>
                    </motion.div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '16px',
                    }}>
                        {FEATURES.map((feat, i) => (
                            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.06 }}
                                className="glass-card glass-card-hover"
                                style={{
                                    padding: '36px 28px',
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '20px',
                                    border: '1px solid var(--glass-border)',
                                }}>
                                <div style={{
                                    display: 'flex', alignItems: 'baseline', gap: '4px',
                                    marginBottom: '20px',
                                }}>
                                    <span className="gradient-text-static" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{feat.stat}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{feat.unit}</span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px', color: 'var(--text-primary)' }}>{feat.title}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{feat.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section style={{ padding: '96px 24px', maxWidth: '700px', margin: '0 auto' }}>
                <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <p style={{
                        fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)',
                        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px',
                    }}>How it works</p>
                    <h2 style={{
                        fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800,
                        letterSpacing: '-0.03em', color: 'var(--text-primary)',
                    }}>
                        Four simple steps
                    </h2>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { n: '01', title: 'Choose a test', desc: 'Select from 7 modules across 5 athletic categories.' },
                        { n: '02', title: 'Perform live', desc: 'Your camera captures real-time pose data — no uploads needed.' },
                        { n: '03', title: 'Get your score', desc: 'Receive a weighted scorecard with radar chart and percentile ranking.' },
                        { n: '04', title: 'Track progress', desc: 'Compare over time, earn badges, and climb the leaderboard.' },
                    ].map((item, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.06 }}
                            className="glass-card"
                            style={{
                                padding: '24px 28px', display: 'flex', gap: '20px', alignItems: 'center',
                                background: 'var(--glass-bg)',
                                backdropFilter: 'blur(16px)',
                                borderRadius: '18px',
                                border: '1px solid var(--glass-border)',
                            }}>
                            <div className="gradient-text-static" style={{
                                fontSize: '0.82rem', fontWeight: 800,
                                fontFamily: "'Inter', monospace", minWidth: '28px',
                            }}>{item.n}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '3px', color: 'var(--text-primary)' }}>{item.title}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA — liquid glass ═══ */}
            <section style={{ padding: '96px 24px' }}>
                <motion.div {...fadeUp} className="liquid-glass-panel liquid-glass-panel-animate" style={{
                    maxWidth: '580px', margin: '0 auto', textAlign: 'center',
                    padding: '56px 40px',
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.06)',
                }}>
                    <h2 style={{
                        fontSize: '1.6rem', fontWeight: 800, marginBottom: '14px',
                        letterSpacing: '-0.02em', color: 'var(--text-primary)',
                    }}>
                        Ready to get started?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        Discover your athletic strengths with AI-powered assessments — completely free.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => navigate('/select-test')}
                            style={{ padding: '15px 36px', fontSize: '0.92rem' }}>
                            Start Your Assessment
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/dashboard')}
                            style={{ padding: '15px 36px', fontSize: '0.92rem' }}>
                            View Dashboard
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{
                padding: '40px 24px', textAlign: 'center',
                fontSize: '0.75rem', color: 'var(--text-muted)',
                borderTop: '1px solid var(--glass-border)',
                background: 'transparent',
            }}>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>AthleteAI</p>
                <p style={{ marginTop: '6px', opacity: 0.6 }}>
                    AI-Powered Sports Assessment · Built for India · 100% Free
                </p>
            </footer>
        </div>
    );
}
