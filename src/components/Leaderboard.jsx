/**
 * Leaderboard.jsx
 * Mock national leaderboard with rankings, percentiles, and scores.
 */
import { motion } from 'framer-motion';

// Mock leaderboard data simulating athletes from across India
const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Aarav Sharma', state: 'Haryana', score: 97, xp: 4200, level: 22 },
    { rank: 2, name: 'Priya Patel', state: 'Gujarat', score: 95, xp: 3800, level: 20 },
    { rank: 3, name: 'Vikram Singh', state: 'Punjab', score: 94, xp: 3600, level: 19 },
    { rank: 4, name: 'Ananya Iyer', state: 'Kerala', score: 92, xp: 3400, level: 18 },
    { rank: 5, name: 'Rohit Kumar', state: 'Bihar', score: 91, xp: 3200, level: 17 },
    { rank: 6, name: 'Meera Das', state: 'West Bengal', score: 89, xp: 3000, level: 16 },
    { rank: 7, name: 'Aditya Rao', state: 'Karnataka', score: 88, xp: 2800, level: 15 },
    { rank: 8, name: 'Kavya Nair', state: 'Tamil Nadu', score: 86, xp: 2600, level: 14 },
    { rank: 9, name: 'Arjun Reddy', state: 'Telangana', score: 85, xp: 2400, level: 13 },
    { rank: 10, name: 'Simran Kaur', state: 'Rajasthan', score: 83, xp: 2200, level: 12 },
];

function getRankBadge(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

function getScoreColor(score) {
    if (score >= 90) return 'var(--neon-green)';
    if (score >= 75) return 'var(--electric-blue)';
    if (score >= 60) return 'var(--warning-yellow)';
    return 'var(--danger-red)';
}

export default function Leaderboard({ currentUserScore, currentUserRank }) {
    // Insert current user into the leaderboard if they have a score
    const leaderboardData = [...MOCK_LEADERBOARD];
    if (currentUserScore > 0) {
        leaderboardData.push({
            rank: currentUserRank || 11,
            name: 'You',
            state: 'Your State',
            score: currentUserScore,
            xp: 0,
            level: 1,
            isCurrentUser: true,
        });
        leaderboardData.sort((a, b) => b.score - a.score);
        leaderboardData.forEach((entry, i) => { entry.rank = i + 1; });
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                }}>
                    🏆 <span className="gradient-text">National Leaderboard</span>
                </h2>
                <span className="badge badge-green">
                    150,000+ Athletes
                </span>
            </div>

            {/* Table Header */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 120px 80px 80px',
                padding: '12px 18px',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '1px solid var(--glass-border)',
            }}>
                <span>Rank</span>
                <span>Athlete</span>
                <span>State</span>
                <span style={{ textAlign: 'center' }}>Score</span>
                <span style={{ textAlign: 'center' }}>Level</span>
            </div>

            {/* Leaderboard Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                {leaderboardData.slice(0, 15).map((entry, index) => (
                    <motion.div
                        key={`${entry.name}-${entry.rank}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 120px 80px 80px',
                            padding: '14px 18px',
                            alignItems: 'center',
                            borderColor: entry.isCurrentUser
                                ? 'var(--neon-green)'
                                : entry.rank <= 3
                                    ? 'rgba(251, 191, 36, 0.3)'
                                    : 'var(--glass-border)',
                            background: entry.isCurrentUser
                                ? 'rgba(13, 148, 136, 0.08)'
                                : 'var(--glass-bg)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                        }}
                    >
                        {/* Rank */}
                        <span style={{
                            fontSize: entry.rank <= 3 ? '1.4rem' : '1rem',
                            fontWeight: 800,
                            color: entry.rank <= 3 ? 'var(--warning-yellow)' : 'var(--text-secondary)',
                        }}>
                            {getRankBadge(entry.rank)}
                        </span>

                        {/* Name */}
                        <span style={{
                            fontWeight: 700,
                            color: entry.isCurrentUser ? 'var(--neon-green)' : 'var(--text-primary)',
                            fontSize: '0.95rem',
                        }}>
                            {entry.name}
                            {entry.isCurrentUser && (
                                <span style={{
                                    marginLeft: '8px',
                                    fontSize: '0.65rem',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: 'rgba(57, 255, 20, 0.2)',
                                    color: 'var(--neon-green)',
                                }}>YOU</span>
                            )}
                        </span>

                        {/* State */}
                        <span style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                        }}>
                            {entry.state}
                        </span>

                        {/* Score */}
                        <span style={{
                            textAlign: 'center',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            fontSize: '1.1rem',
                            color: getScoreColor(entry.score),
                        }}>
                            {entry.score}
                        </span>

                        {/* Level */}
                        <span style={{
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            color: 'var(--electric-blue)',
                        }}>
                            Lv.{entry.level}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
