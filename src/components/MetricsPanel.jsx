/**
 * MetricsPanel.jsx
 * Real-time metrics display during assessment.
 * Shows rep count, timer, joint angles, accuracy, AI confidence, and form quality.
 */
import { motion } from 'framer-motion';

function getQualityColor(quality) {
    switch (quality) {
        case 'good': return 'var(--neon-green)';
        case 'warning': return 'var(--warning-yellow)';
        case 'bad': return 'var(--danger-red)';
        default: return 'var(--text-secondary)';
    }
}

function getQualityLabel(quality) {
    switch (quality) {
        case 'good': return 'EXCELLENT';
        case 'warning': return 'ADJUST FORM';
        case 'bad': return 'INCORRECT';
        default: return 'WAITING';
    }
}

export default function MetricsPanel({ metrics, activity, confidence, cheatWarnings }) {
    const {
        repCount = 0,
        holdDuration = 0,
        formScore = 0,
        stabilityScore = 0,
        postureAccuracy = 0,
        depthPercent = 0,
        jumpDistance = 0,
        jointAngles = {},
        phase,
        formQuality = 'good',
    } = metrics || {};

    const isTimed = activity === 'wall-sit';
    const isJump = activity === 'broad-jump';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
        }}>
            {/* Form Quality Indicator */}
            <motion.div
                className="glass-card"
                style={{
                    padding: '16px 20px',
                    textAlign: 'center',
                    borderColor: getQualityColor(formQuality),
                    borderWidth: '2px',
                }}
                animate={{
                    boxShadow: `0 0 20px ${getQualityColor(formQuality)}33`,
                }}
                transition={{ duration: 0.3 }}
            >
                <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px',
                }}>Form Quality</div>
                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: getQualityColor(formQuality),
                    letterSpacing: '2px',
                }}>
                    {getQualityLabel(formQuality)}
                </div>
            </motion.div>

            {/* Primary Metrics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
            }}>
                {/* Rep Count or Duration */}
                <MetricCard
                    label={isTimed ? 'Hold Time' : isJump ? 'Attempts' : 'Rep Count'}
                    value={isTimed ? `${holdDuration}s` : repCount}
                    color="var(--neon-green)"
                    large
                />

                {/* Form Score */}
                <MetricCard
                    label="Form Score"
                    value={`${formScore}%`}
                    color="var(--electric-blue)"
                    large
                />

                {/* AI Confidence */}
                <MetricCard
                    label="AI Confidence"
                    value={`${confidence}%`}
                    color="var(--accent-purple)"
                />

                {/* Activity-specific metric */}
                {activity === 'wall-sit' && (
                    <MetricCard
                        label="Stability"
                        value={`${stabilityScore}%`}
                        color="var(--electric-blue)"
                    />
                )}
                {activity === 'squats' && (
                    <MetricCard
                        label="Depth"
                        value={`${depthPercent}%`}
                        color="var(--electric-blue)"
                    />
                )}
                {activity === 'broad-jump' && (
                    <MetricCard
                        label="Distance"
                        value={`${jumpDistance}cm`}
                        color="var(--electric-blue)"
                    />
                )}
                {activity === 'sit-ups' && (
                    <MetricCard
                        label="Accuracy"
                        value={`${postureAccuracy || formScore}%`}
                        color="var(--electric-blue)"
                    />
                )}
            </div>

            {/* Joint Angles */}
            {Object.keys(jointAngles).length > 0 && (
                <div className="glass-card" style={{ padding: '14px 18px' }}>
                    <div style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '10px',
                    }}>Joint Angles</div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                    }}>
                        {Object.entries(jointAngles).map(([joint, angle]) => (
                            <div key={joint} style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '6px',
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    textTransform: 'capitalize',
                                }}>
                                    {joint.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    color: 'var(--electric-blue)',
                                    fontFamily: 'monospace',
                                }}>
                                    {angle}°
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cheat Warnings */}
            {cheatWarnings && cheatWarnings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        background: 'rgba(255, 59, 92, 0.15)',
                        border: '1px solid rgba(255, 59, 92, 0.4)',
                    }}
                >
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--danger-red)',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                    }}>⚠ Warning</div>
                    {cheatWarnings.map((warning, i) => (
                        <div key={i} style={{
                            fontSize: '0.8rem',
                            color: 'var(--danger-red)',
                            opacity: 0.9,
                        }}>
                            {warning}
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

/**
 * Individual metric card component.
 */
function MetricCard({ label, value, color, large }) {
    return (
        <div className="glass-card" style={{
            padding: large ? '16px' : '12px',
            textAlign: 'center',
        }}>
            <div style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
            }}>{label}</div>
            <div style={{
                fontSize: large ? '1.8rem' : '1.3rem',
                fontWeight: 800,
                color,
                fontFamily: 'monospace',
            }}>{value}</div>
        </div>
    );
}
