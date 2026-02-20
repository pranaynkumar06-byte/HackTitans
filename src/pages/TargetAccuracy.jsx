/**
 * TargetAccuracy.jsx
 * MODULE 4: Target Accuracy Drill
 * Multi-sport accuracy tracking: Football, Cricket, Basketball.
 * Interactive target board for recording hits/misses.
 */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackPopup from '../components/FeedbackPopup';
import TrendGraph from '../components/TrendGraph';

const SPORTS = [
    { id: 'football', name: 'Football', icon: '⚽', target: 'goal zones' },
    { id: 'cricket', name: 'Cricket', icon: '🏏', target: 'wickets' },
    { id: 'basketball', name: 'Basketball', icon: '🏀', target: 'hoop zones' },
    { id: 'general', name: 'General', icon: '🎯', target: 'target zones' },
];

// 3x3 target grid (9 zones)
const ZONES = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    label: ['TL', 'TC', 'TR', 'ML', 'MC', 'MR', 'BL', 'BC', 'BR'][i],
    points: [2, 3, 2, 3, 5, 3, 2, 3, 2][i], // Center is hardest
}));

export default function TargetAccuracy() {
    const [sport, setSport] = useState('football');
    const [attempts, setAttempts] = useState([]);
    const [sessions] = useState([
        { acc: 62, consistency: 70, attempts: 20 },
        { acc: 68, consistency: 74, attempts: 25 },
        { acc: 72, consistency: 78, attempts: 22 },
        { acc: 75, consistency: 82, attempts: 30 },
    ]);
    const [showFeedback, setShowFeedback] = useState(false);

    const totalAttempts = attempts.length;
    const hits = attempts.filter(a => a.hit).length;
    const accuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 0;
    const totalPoints = attempts.reduce((sum, a) => sum + (a.hit ? a.points : 0), 0);
    const maxPoints = attempts.reduce((sum, a) => sum + a.points, 0);

    // Consistency: measure how evenly spread the hits are across zones
    const consistency = (() => {
        if (hits < 3) return 0;
        const zoneHits = ZONES.map(z => attempts.filter(a => a.zone === z.id && a.hit).length);
        const avg = hits / 9;
        const variance = zoneHits.reduce((s, c) => s + Math.pow(c - avg, 2), 0) / 9;
        return Math.round(Math.max(0, 100 - variance * 20));
    })();

    function recordAttempt(zone, hit) {
        setAttempts(prev => [...prev, { zone: zone.id, hit, points: zone.points, time: Date.now() }]);
    }

    function resetSession() {
        setAttempts([]);
        setShowFeedback(false);
    }

    // Trigger feedback after every 10 attempts
    const prevAttemptsLen = useRef(0);
    if (totalAttempts > 0 && totalAttempts % 10 === 0 && totalAttempts !== prevAttemptsLen.current) {
        prevAttemptsLen.current = totalAttempts;
        setTimeout(() => setShowFeedback(true), 500);
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
                    🎯 <span className="gradient-text">Target Accuracy Drill</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Record hits and misses on the target grid. Track accuracy and consistency across sports.
                </p>

                {/* Sport Selector */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {SPORTS.map(s => (
                        <button key={s.id}
                            className={s.id === sport ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => { setSport(s.id); resetSession(); }}
                            style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                            {s.icon} {s.name}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
                    {/* Target Grid */}
                    <div>
                        <div style={{
                            fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px',
                        }}>Tap zone: Left = Hit, Right = Miss</div>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px',
                            background: 'var(--navy-mid)', padding: '12px', borderRadius: '16px',
                            border: '2px solid var(--glass-border)',
                        }}>
                            {ZONES.map(zone => {
                                const zoneAttempts = attempts.filter(a => a.zone === zone.id);
                                const zoneHits = zoneAttempts.filter(a => a.hit).length;
                                const zoneMisses = zoneAttempts.length - zoneHits;

                                return (
                                    <motion.div
                                        key={zone.id}
                                        whileTap={{ scale: 0.92 }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            recordAttempt(zone, true);
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            recordAttempt(zone, false);
                                        }}
                                        className="glass-card glass-card-hover"
                                        style={{
                                            padding: '16px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            minHeight: '80px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderColor: zoneHits > zoneMisses ? 'rgba(57, 255, 20, 0.3)' : zoneMisses > 0 ? 'rgba(255, 59, 92, 0.2)' : 'var(--glass-border)',
                                            userSelect: 'none',
                                        }}
                                    >
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{zone.label}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--electric-blue)' }}>
                                            {zone.points}pt
                                        </div>
                                        {zoneAttempts.length > 0 && (
                                            <div style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                                                <span style={{ color: 'var(--neon-green)' }}>{zoneHits}✓</span>
                                                {' '}
                                                <span style={{ color: 'var(--danger-red)' }}>{zoneMisses}✗</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                        <div style={{
                            marginTop: '8px', display: 'flex', gap: '8px',
                        }}>
                            <button className="btn-secondary" onClick={resetSession}
                                style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}>
                                🔄 Reset
                            </button>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Attempts</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{totalAttempts}</div>
                            </div>
                            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hits</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-green)' }}>{hits}</div>
                            </div>
                            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Accuracy</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: accuracy >= 70 ? 'var(--neon-green)' : accuracy >= 50 ? 'var(--warning-yellow)' : 'var(--danger-red)' }}>{accuracy}%</div>
                            </div>
                            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consistency</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--electric-blue)' }}>{consistency}%</div>
                            </div>
                        </div>

                        {/* Points */}
                        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                                {totalPoints} / {maxPoints} pts
                            </div>
                        </div>

                        {/* Recent attempts feed */}
                        <div className="glass-card" style={{ padding: '14px', maxHeight: '180px', overflow: 'auto' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Recent</div>
                            <AnimatePresence>
                                {attempts.slice(-8).reverse().map((a, i) => (
                                    <motion.div key={attempts.length - i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '0.8rem' }}>
                                        <span style={{ color: a.hit ? 'var(--neon-green)' : 'var(--danger-red)', fontWeight: 700, width: '20px' }}>
                                            {a.hit ? '✓' : '✗'}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>Zone {ZONES[a.zone]?.label}</span>
                                        {a.hit && <span style={{ color: 'var(--accent-purple)', fontSize: '0.7rem' }}>+{a.points}pt</span>}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>📈 Accuracy Progress</h3>
                    <TrendGraph data={sessions.map(s => s.acc)} labels={sessions.map((_, i) => `S${i + 1}`)} height={160} />
                </div>
            </motion.div>

            <style>{`@media(max-width:768px){div[style*="grid-template-columns: 300px"]{grid-template-columns:1fr!important}}`}</style>
            <FeedbackPopup isOpen={showFeedback} onClose={() => setShowFeedback(false)} testName="Target Accuracy" />
        </div>
    );
}
