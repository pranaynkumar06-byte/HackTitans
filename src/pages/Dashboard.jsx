/**
 * Dashboard.jsx
 * Athlete dashboard with radar chart, module scores, badges, test history, and trend graph.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RadarChart from '../components/RadarChart';
import TrendGraph from '../components/TrendGraph';
import Scorecard from '../components/Scorecard';
import Leaderboard from '../components/Leaderboard';
import { getLevel, getLevelProgress, checkBadges, calculatePercentile, calculateNationalRank, calculateOverallScore } from '../utils/scoringSystem';

// Mock athlete data
const MOCK_PROFILE = {
    name: 'Athlete',
    id: 'SAI-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    sport: 'Multi-Sport',
    totalXP: 2450,
    totalTests: 14,
};

const MOCK_SCORES = {
    speed: 72,
    strength: 68,
    endurance: 65,
    skill: 78,
    reaction: 82,
};

const MOCK_HISTORY = [
    { date: '2026-02-14', module: 'Sprint', score: 68, details: '20m in 3.4s' },
    { date: '2026-02-15', module: 'Push-Ups', score: 72, details: '32 reps, 85% form' },
    { date: '2026-02-16', module: 'Beep Test', score: 60, details: 'Level 7, VO2: 41' },
    { date: '2026-02-17', module: 'Reaction', score: 85, details: 'Avg 215ms' },
    { date: '2026-02-18', module: 'Target', score: 78, details: '78% accuracy' },
    { date: '2026-02-19', module: 'V. Jump', score: 65, details: '42cm height' },
    { date: '2026-02-20', module: 'T-Test', score: 70, details: '10.8s completion' },
];

const TREND_DATA = [55, 58, 62, 65, 68, 70, 72, 74, 72, 75, 78, 76, 80, 82];

export default function Dashboard() {
    const navigate = useNavigate();
    const [showScorecard, setShowScorecard] = useState(false);

    const level = getLevel(MOCK_PROFILE.totalXP);
    const progress = getLevelProgress(MOCK_PROFILE.totalXP);
    const overall = calculateOverallScore(MOCK_SCORES);
    const percentile = calculatePercentile(overall);
    const rank = calculateNationalRank(percentile);

    const earnedBadges = checkBadges({
        sprintScore: MOCK_SCORES.speed,
        pushUpReps: 32,
        jumpHeight: 42,
        beepLevel: 7,
        targetAccuracy: MOCK_SCORES.skill,
        reactionAvg: 215,
        moduleScores: MOCK_SCORES,
    });

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                        📊 <span className="gradient-text">Athlete Dashboard</span>
                    </h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" onClick={() => navigate('/select-test')} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🚀 New Test</button>
                        <button className="btn-secondary" onClick={() => setShowScorecard(true)} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>📄 Scorecard</button>
                    </div>
                </div>

                {/* Top cards: Profile + Score + Rank */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {/* Profile */}
                    <div className="glass-card" style={{ padding: '20px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, var(--neon-green), var(--electric-blue))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.3rem', fontWeight: 800, color: '#ffffff',
                            }}>{MOCK_PROFILE.name[0]}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{MOCK_PROFILE.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ID: {MOCK_PROFILE.id}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="badge badge-green">Level {level}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{progress.current} / {progress.needed} XP</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress.percent}%` }} /></div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <span className="badge badge-green">⚡ {MOCK_PROFILE.totalXP} XP</span>
                            <span className="badge badge-blue">📋 {MOCK_PROFILE.totalTests} Tests</span>
                        </div>
                    </div>

                    {/* Overall Score */}
                    <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Overall Score</div>
                        <div className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1 }}>{overall}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>out of 100</div>
                        <div className="badge badge-green" style={{ marginTop: '8px' }}>Top {Math.round(100 - percentile)}% Nationally</div>
                    </div>

                    {/* National Rank */}
                    <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>National Rank</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--neon-green)', lineHeight: 1.1 }}>#{rank.toLocaleString()}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>out of 150,000</div>
                    </div>
                </div>

                {/* Radar Chart + Module Scores */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div className="glass-card" style={{ padding: '24px', textAlign: 'center', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Performance Radar</h3>
                        <RadarChart data={[MOCK_SCORES.speed, MOCK_SCORES.strength, MOCK_SCORES.endurance, MOCK_SCORES.skill, MOCK_SCORES.reaction]} size={250} />
                    </div>

                    <div className="glass-card" style={{ padding: '24px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px' }}>Module Scores</h3>
                        {[
                            { label: 'Speed & Agility', value: MOCK_SCORES.speed, icon: '🏃', color: '#39ff14' },
                            { label: 'Strength', value: MOCK_SCORES.strength, icon: '💪', color: '#00d4ff' },
                            { label: 'Endurance', value: MOCK_SCORES.endurance, icon: '🫀', color: '#a855f7' },
                            { label: 'Skill Accuracy', value: MOCK_SCORES.skill, icon: '🎯', color: '#fbbf24' },
                            { label: 'Reaction Time', value: MOCK_SCORES.reaction, icon: '🧠', color: '#ff3b5c' },
                        ].map((m) => (
                            <div key={m.label} style={{ marginBottom: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                                    <span>{m.icon} {m.label}</span>
                                    <span style={{ fontWeight: 700, color: m.color }}>{m.value}/100</span>
                                </div>
                                <div className="progress-bar" style={{ height: '8px' }}>
                                    <div style={{
                                        height: '100%', borderRadius: '4px', width: `${m.value}%`,
                                        background: m.color, transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badges */}
                <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>🏅 Badges Earned ({earnedBadges.length})</h3>
                    {earnedBadges.length > 0 ? (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {earnedBadges.map(b => (
                                <div key={b.id} className="glass-card" style={{ padding: '10px 14px', textAlign: 'center', minWidth: '90px' }}>
                                    <div style={{ fontSize: '1.4rem' }}>{b.icon}</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--neon-green)' }}>{b.name}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Complete tests to earn badges! 🏆</p>
                    )}
                </div>

                {/* Trend Graph */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>📈 Performance Trend</h3>
                    <TrendGraph data={TREND_DATA} labels={TREND_DATA.map((_, i) => `W${i + 1}`)} height={180} />
                </div>

                {/* Test History */}
                <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>📋 Test History</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    {['Date', 'Module', 'Score', 'Details'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_HISTORY.map((h, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{h.date}</td>
                                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{h.module}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{ fontWeight: 700, color: h.score >= 80 ? 'var(--neon-green)' : h.score >= 60 ? 'var(--warning-yellow)' : 'var(--danger-red)' }}>
                                                {h.score}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{h.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leaderboard */}
                <Leaderboard />

            </motion.div>

            {/* Scorecard Modal */}
            {showScorecard && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px',
                }} onClick={() => setShowScorecard(false)}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                        style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
                        onClick={e => e.stopPropagation()}>
                        <Scorecard
                            athlete={MOCK_PROFILE}
                            scores={{ ...MOCK_SCORES, overall, percentile, rank }}
                            onClose={() => setShowScorecard(false)}
                        />
                    </motion.div>
                </div>
            )}

            <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
        </div>
    );
}
