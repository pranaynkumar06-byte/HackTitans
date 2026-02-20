/**
 * TestSelector.jsx
 * Shows all available athletics/test options in a beautiful grid.
 * Navigates to the chosen test when clicked.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TESTS = [
    {
        id: 'sprint', path: '/test/sprint', icon: '🏃', name: 'Sprint Test',
        desc: '20m / 40m sprint timing with AI motion tracking',
        category: 'Speed & Agility', color: '#14b8a6', difficulty: 'Medium',
    },
    {
        id: 't-test', path: '/test/t-test', icon: '⚡', name: 'T-Test Agility',
        desc: 'Agility drill with direction change efficiency scoring',
        category: 'Speed & Agility', color: '#14b8a6', difficulty: 'Hard',
    },
    {
        id: 'pushups', path: '/test/pushups', icon: '💪', name: 'Push-Up Test',
        desc: '1-minute timed push-ups with AI rep counting & form analysis',
        category: 'Strength', color: '#22d3ee', difficulty: 'Medium',
    },
    {
        id: 'vjump', path: '/test/vertical-jump', icon: '🦘', name: 'Vertical Jump',
        desc: 'Jump height detection with explosive power scoring',
        category: 'Strength', color: '#22d3ee', difficulty: 'Easy',
    },
    {
        id: 'beep', path: '/test/beep', icon: '🫀', name: 'Beep Test',
        desc: 'Progressive shuttle run with VO2 max estimation',
        category: 'Endurance', color: '#c084fc', difficulty: 'Hard',
    },
    {
        id: 'target', path: '/test/target', icon: '🎯', name: 'Target Accuracy',
        desc: 'Multi-sport accuracy tracking (Football, Cricket, Basketball)',
        category: 'Skill', color: '#fbbf24', difficulty: 'Easy',
    },
    {
        id: 'reaction', path: '/test/reaction', icon: '🧠', name: 'Reaction Time',
        desc: '3 interactive reflex games — test your reaction speed',
        category: 'Reaction', color: '#fb7185', difficulty: 'Easy',
    },
    {
        id: 'assessment', path: '/assessment', icon: '📹', name: 'Camera Assessment',
        desc: 'Wall Sit, Sit-Ups, Squats, Broad Jump with live pose tracking',
        category: 'Multi-Test', color: '#34d399', difficulty: 'Medium',
    },
];

const difficultyColors = {
    Easy: 'var(--success-green)',
    Medium: 'var(--warning-yellow)',
    Hard: 'var(--danger-red)',
};

export default function TestSelector() {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                        🏅 <span className="gradient-text">Choose Your Test</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                        Select an assessment module. All tests use your device's live camera for real-time AI analysis.
                    </p>
                </div>

                {/* Test Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                }}>
                    {TESTS.map((test, i) => (
                        <motion.div
                            key={test.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="glass-card glass-card-hover"
                            onClick={() => navigate(test.path)}
                            style={{
                                padding: '24px', cursor: 'pointer',
                                borderTop: `3px solid ${test.color}`,
                                display: 'flex', flexDirection: 'column', gap: '10px',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <span style={{ fontSize: '2.2rem' }}>{test.icon}</span>
                                <span style={{
                                    fontSize: '0.6rem', fontWeight: 700, padding: '4px 10px',
                                    borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.5px',
                                    background: `${test.color}15`, color: test.color,
                                    border: `1px solid ${test.color}40`,
                                }}>
                                    {test.category}
                                </span>
                            </div>

                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{test.name}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                                {test.desc}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 600,
                                    color: difficultyColors[test.difficulty],
                                }}>
                                    ● {test.difficulty}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 700, color: test.color,
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                }}>
                                    Start →
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
