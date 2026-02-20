/**
 * ActivitySelector.jsx
 * Dropdown component for selecting the assessment activity.
 */
import { ACTIVITIES } from '../hooks/useActivityLogic';

const ACTIVITY_ICONS = {
    'wall-sit': '🧱',
    'sit-ups': '🏋️',
    'squats': '🦵',
    'broad-jump': '🚀',
};

export default function ActivitySelector({ activity, setActivity, disabled }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        }}>
            <label style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
            }}>
                Select Activity
            </label>
            <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                disabled={disabled}
                style={{
                    background: 'var(--navy-mid)',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    transition: 'border-color 0.3s ease',
                    opacity: disabled ? 0.5 : 1,
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--neon-green)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'var(--glass-border)';
                }}
            >
                {Object.entries(ACTIVITIES).map(([key, config]) => (
                    <option key={key} value={key}>
                        {ACTIVITY_ICONS[key]} {config.name}
                    </option>
                ))}
            </select>

            {/* Activity info chips */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginTop: '4px',
            }}>
                {ACTIVITIES[activity]?.metrics.map((metric) => (
                    <span key={metric} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                        {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                ))}
            </div>
        </div>
    );
}
