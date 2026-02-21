/**
 * Scorecard.jsx
 * Printable athlete performance scorecard with all module scores.
 */
import RadarChart from './RadarChart';

export default function Scorecard({ athlete, scores, onClose }) {
    const {
        name = 'Athlete',
        id = 'SAI-000000',
        sport = 'Multi-Sport',
    } = athlete || {};

    const {
        speed = 0, strength = 0, endurance = 0, skill = 0, reaction = 0,
        overall = 0, percentile = 50, rank = 0,
    } = scores || {};

    const radarData = [speed, strength, endurance, skill, reaction];

    function handlePrint() {
        window.print();
    }

    return (
        <div style={{
            background: 'var(--glass-bg)', borderRadius: '20px',
            padding: '36px', maxWidth: '600px', margin: '0 auto',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: 'var(--shadow-lg)',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'start',
                marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px',
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.3rem' }}>⚡</span>
                        <span className="gradient-text" style={{ fontSize: '1.1rem', fontWeight: 800 }}>AthleteAI</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Performance Scorecard</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ID: {id}</div>
                    <div style={{ color: 'var(--electric-blue)', fontSize: '0.75rem' }}>{sport}</div>
                </div>
            </div>

            {/* Overall Score */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Overall Score
                </div>
                <div className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>
                    {overall}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>out of 100</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
                    <span className="badge badge-green">Top {Math.round(100 - percentile)}%</span>
                    <span className="badge badge-blue">Rank #{rank.toLocaleString()}</span>
                </div>
            </div>

            {/* Radar Chart */}
            <div style={{ marginBottom: '24px' }}>
                <RadarChart data={radarData} size={260} />
            </div>

            {/* Module Scores */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px',
                marginBottom: '24px',
            }}>
                {[
                    { label: 'Speed', value: speed, icon: '🏃' },
                    { label: 'Strength', value: strength, icon: '💪' },
                    { label: 'Endurance', value: endurance, icon: '🫀' },
                    { label: 'Skill', value: skill, icon: '🎯' },
                    { label: 'Reaction', value: reaction, icon: '🧠' },
                ].map((m) => (
                    <div key={m.label} className="glass-card" style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem' }}>{m.icon}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--neon-green)', margin: '4px 0' }}>
                            {m.value}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                            {m.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Date + Actions */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: '1px solid var(--glass-border)', paddingTop: '16px',
            }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Generated: {new Date().toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" onClick={handlePrint}
                        style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                        🖨 Print
                    </button>
                    {onClose && (
                        <button className="btn-primary" onClick={onClose}
                            style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
