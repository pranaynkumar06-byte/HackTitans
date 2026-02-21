/**
 * Assessment.jsx
 * Core assessment page with camera feed, pose overlay, metrics panel,
 * activity selector, and control buttons.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CameraFeed from '../components/CameraFeed';
import PoseOverlay from '../components/PoseOverlay';
import MetricsPanel from '../components/MetricsPanel';
import ActivitySelector from '../components/ActivitySelector';
import usePoseDetection from '../hooks/usePoseDetection';
import useActivityLogic from '../hooks/useActivityLogic';
import { runCheatDetection } from '../utils/cheatDetection';
import { calculateFormScore, calculateXP } from '../utils/scoringSystem';
import { saveTestResult } from '../services/offlineStorage';
import { isOnline } from '../services/syncService';

export default function Assessment() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const overlayContainerRef = useRef(null);

    // Pose detection
    const {
        landmarks,
        isLoading,
        isRunning,
        confidence,
        facingMode,
        initializePose,
        startCamera,
        stopCamera,
        switchCamera,
    } = usePoseDetection();

    // Activity logic
    const {
        activity,
        setActivity,
        metrics,
        formScores,
        isActive,
        processFrame,
        startSession,
        stopSession,
        resetMetrics,
    } = useActivityLogic();

    const [cheatWarnings, setCheatWarnings] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [finalResults, setFinalResults] = useState(null);
    const [cameraError, setCameraError] = useState(null);

    // Initialize MediaPipe on mount
    useEffect(() => {
        initializePose();
    }, [initializePose]);

    // Process landmarks on each frame
    useEffect(() => {
        if (landmarks && isActive) {
            processFrame(landmarks);

            // Run cheat detection
            const cheatResult = runCheatDetection(landmarks, null, 640, 480, null);
            setCheatWarnings(cheatResult.warnings);
        }
    }, [landmarks, isActive, processFrame]);

    // Handle Start
    const handleStart = useCallback(async () => {
        try {
            setCameraError(null);
            if (!isRunning && videoRef.current) {
                await startCamera(videoRef.current, null);
            }
            resetMetrics();
            startSession();
        } catch (err) {
            setCameraError('Failed to access camera. Please grant permission and try again.');
        }
    }, [isRunning, startCamera, resetMetrics, startSession]);

    // Handle Stop and show results
    const handleStop = useCallback(async () => {
        stopSession();

        const endurance = Math.min(100, activity === 'wall-sit'
            ? Math.round((metrics.holdDuration / 60) * 100)
            : activity === 'broad-jump'
                ? Math.round((metrics.jumpDistance / 3) * 100)
                : Math.round((metrics.repCount / 20) * 100)
        );
        const consistency = formScores.length > 1
            ? Math.round(100 - (formScores.reduce((s, v, _, a) => s + Math.abs(v - a.reduce((x, y) => x + y) / a.length), 0) / formScores.length))
            : 100;
        const finalScore = calculateFormScore(metrics.formScore, endurance, consistency, confidence);
        const xp = calculateXP(metrics.repCount || 1, metrics.formScore);

        const results = {
            activity,
            activityName: activity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            score: finalScore,
            formAccuracy: metrics.formScore,
            endurance,
            consistency,
            aiConfidence: confidence,
            reps: metrics.repCount,
            duration: metrics.holdDuration,
            distance: metrics.jumpDistance,
            xp,
            formScores,
        };

        setFinalResults(results);
        setShowResults(true);

        // Save to IndexedDB
        try {
            await saveTestResult(results);
        } catch (err) {
            console.error('Failed to save result:', err);
        }
    }, [activity, metrics, formScores, confidence, stopSession]);

    // Handle Reset
    const handleReset = useCallback(() => {
        resetMetrics();
        setCheatWarnings([]);
        setShowResults(false);
        setFinalResults(null);
    }, [resetMetrics]);

    // Handle full stop (stop camera too)
    const handleFullStop = useCallback(() => {
        handleStop();
        stopCamera();
    }, [handleStop, stopCamera]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--navy-darkest)' }}>
            <div className="animated-bg" />

            {/* Header */}
            <header style={{
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(5, 8, 22, 0.8)',
                backdropFilter: 'blur(20px)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => { stopCamera(); navigate('/'); }} style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '1.1rem', padding: '8px',
                    }}>
                        ← Back
                    </button>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                        <span className="gradient-text">Assessment</span>
                    </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {!isOnline() && (
                        <span className="badge badge-red">📴 Offline</span>
                    )}
                    {isLoading && (
                        <span className="badge badge-yellow">⏳ Loading AI...</span>
                    )}
                    {isRunning && (
                        <span className="badge badge-green">🟢 Camera Active</span>
                    )}
                </div>
            </header>

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
                gap: '20px',
                alignItems: 'start',
            }}>
                {/* LEFT: Camera + Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Camera Feed with Pose Overlay */}
                    <div ref={overlayContainerRef} style={{ position: 'relative', width: '100%' }}>
                        <CameraFeed ref={videoRef} isRunning={isRunning} facingMode={facingMode} onSwitchCamera={switchCamera} />
                        {landmarks && isRunning && (
                            <PoseOverlay
                                landmarks={landmarks}
                                formQuality={metrics.formQuality}
                                width={640}
                                height={480}
                            />
                        )}
                    </div>

                    {/* Camera Error */}
                    {cameraError && (
                        <div style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            background: 'rgba(255, 59, 92, 0.15)',
                            border: '1px solid rgba(255, 59, 92, 0.4)',
                            color: 'var(--danger-red)',
                            fontSize: '0.85rem',
                        }}>
                            ⚠ {cameraError}
                        </div>
                    )}

                    {/* Cheat Warning Banner */}
                    <AnimatePresence>
                        {cheatWarnings.some(w => w.includes('Invalid')) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 59, 92, 0.2)',
                                    border: '2px solid var(--danger-red)',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 800,
                                    color: 'var(--danger-red)',
                                }}>
                                    🚫 Invalid Attempt – Please Retake the Test
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Activity Selector */}
                    <ActivitySelector
                        activity={activity}
                        setActivity={setActivity}
                        disabled={isActive}
                    />

                    {/* Control Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}>
                        {!isActive ? (
                            <button
                                className="btn-primary"
                                onClick={handleStart}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    fontSize: '1rem',
                                    opacity: isLoading ? 0.5 : 1,
                                    minWidth: '140px',
                                }}
                            >
                                {isLoading ? '⏳ Loading AI...' : '▶ Start Assessment'}
                            </button>
                        ) : (
                            <button
                                className="btn-danger"
                                onClick={handleStop}
                                style={{ flex: 1, padding: '16px', fontSize: '1rem', minWidth: '140px' }}
                            >
                                ⏹ Stop
                            </button>
                        )}
                        <button
                            className="btn-secondary"
                            onClick={handleReset}
                            style={{ padding: '16px 24px', fontSize: '1rem' }}
                        >
                            🔄 Reset
                        </button>
                    </div>
                </div>

                {/* RIGHT: Metrics Panel */}
                <div style={{
                    position: 'sticky',
                    top: '80px',
                }}>
                    <MetricsPanel
                        metrics={metrics}
                        activity={activity}
                        confidence={confidence}
                        cheatWarnings={cheatWarnings}
                    />
                </div>
            </div>

            {/* Results Modal */}
            <AnimatePresence>
                {showResults && finalResults && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 200,
                            padding: '20px',
                        }}
                        onClick={() => setShowResults(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="glass-card"
                            style={{
                                padding: '40px',
                                maxWidth: '480px',
                                width: '100%',
                                textAlign: 'center',
                                border: '2px solid var(--neon-green)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
                                Assessment Complete!
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                                {finalResults.activityName}
                            </p>

                            {/* Score Circle */}
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '4px solid var(--neon-green)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                boxShadow: '0 0 30px rgba(57, 255, 20, 0.3)',
                            }}>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 900,
                                    lineHeight: 1,
                                }} className="gradient-text">
                                    {finalResults.score}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 100</div>
                            </div>

                            {/* Score Breakdown */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '24px',
                                textAlign: 'left',
                            }}>
                                <ScoreRow label="Form Accuracy" value={`${finalResults.formAccuracy}%`} weight="40%" />
                                <ScoreRow label="Endurance" value={`${finalResults.endurance}%`} weight="30%" />
                                <ScoreRow label="Consistency" value={`${finalResults.consistency}%`} weight="20%" />
                                <ScoreRow label="AI Confidence" value={`${finalResults.aiConfidence}%`} weight="10%" />
                            </div>

                            {/* XP Earned */}
                            <div className="glass-card" style={{
                                padding: '12px 16px',
                                marginBottom: '24px',
                                display: 'flex',
                                justifyContent: 'space-around',
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--neon-green)' }}>+{finalResults.xp}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>XP Earned</div>
                                </div>
                                {finalResults.reps > 0 && (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--electric-blue)' }}>{finalResults.reps}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {activity === 'broad-jump' ? 'Attempts' : 'Reps'}
                                        </div>
                                    </div>
                                )}
                                {finalResults.duration > 0 && (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--electric-blue)' }}>{finalResults.duration}s</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Duration</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn-primary" onClick={() => { setShowResults(false); handleReset(); }}
                                    style={{ flex: 1, padding: '14px' }}>
                                    🔄 Try Again
                                </button>
                                <button className="btn-secondary" onClick={() => navigate('/dashboard')}
                                    style={{ flex: 1, padding: '14px' }}>
                                    📊 Dashboard
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive CSS for mobile */}
            <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: minmax(0, 2fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}

function ScoreRow({ label, value, weight }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Weight: {weight}</div>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--electric-blue)' }}>{value}</div>
        </div>
    );
}
