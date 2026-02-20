/**
 * CameraFeed.jsx
 * Renders the webcam video element with proper sizing.
 * Used in the Assessment page alongside PoseOverlay.
 */
import { forwardRef } from 'react';

const CameraFeed = forwardRef(function CameraFeed({ isRunning }, ref) {
    return (
        <div className="camera-container" style={{
            position: 'relative',
            width: '100%',
            maxWidth: '640px',
            aspectRatio: '4/3',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'var(--navy-mid)',
            border: isRunning ? '2px solid var(--neon-green)' : '2px solid var(--glass-border)',
            boxShadow: isRunning ? '0 0 20px rgba(57, 255, 20, 0.2)' : 'var(--glass-shadow)',
            transition: 'all 0.3s ease',
        }}>
            <video
                ref={ref}
                playsInline
                muted
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)', // Mirror for selfie view
                    display: isRunning ? 'block' : 'none',
                }}
            />

            {!isRunning && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    color: 'var(--text-secondary)',
                }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 7l-7 5 7 5V7z" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <p style={{ fontSize: '1rem', fontWeight: 500 }}>Camera will activate when you start</p>
                </div>
            )}

            {/* Recording indicator */}
            {isRunning && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(255, 59, 92, 0.8)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'white',
                }}>
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#fff',
                        animation: 'pulse-neon 1s infinite',
                    }} />
                    REC
                </div>
            )}
        </div>
    );
});

export default CameraFeed;
