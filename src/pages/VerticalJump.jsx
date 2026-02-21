/**
 * VerticalJump.jsx
 * MODULE 2B: Vertical Jump Test
 * Detects standing reach, jump peak, calculates explosive power and landing stability.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import CameraFeed from '../components/CameraFeed';
import PoseOverlay from '../components/PoseOverlay';
import CheatAlertOverlay from '../components/CheatAlertOverlay';
import FeedbackPopup from '../components/FeedbackPopup';
import usePoseDetection from '../hooks/usePoseDetection';
import { extractLandmarks } from '../utils/calculateAngle';
import { runCheatDetection, playAlertBeep } from '../utils/cheatDetection';

export default function VerticalJump() {
    const videoRef = useRef(null);
    const { landmarks, isLoading, isRunning, confidence, facingMode, initializePose, startCamera, stopCamera, switchCamera } = usePoseDetection();

    const [phase, setPhase] = useState('idle'); // idle, calibrating, ready, jumping, landed
    const [standingReach, setStandingReach] = useState(null);
    const [jumpPeak, setJumpPeak] = useState(null);
    const [jumpHeight, setJumpHeight] = useState(0);
    const [powerScore, setPowerScore] = useState(0);
    const [landingStability, setLandingStability] = useState(0);
    const [attempts, setAttempts] = useState([]);
    const [bestJump, setBestJump] = useState(0);

    const standingRef = useRef(null);
    const peakRef = useRef(null);
    const prevHipY = useRef(null);
    const stabilityFrames = useRef([]);
    const lastBeepRef = useRef(0);

    const [cheatAlerts, setCheatAlerts] = useState([]);
    const [showRedOverlay, setShowRedOverlay] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => { initializePose(); }, [initializePose]);

    useEffect(() => {
        if (!landmarks || phase === 'idle') return;
        const lm = extractLandmarks(landmarks);
        if (!lm) return;

        // Cheat detection
        const cheatResult = runCheatDetection(landmarks, null, 0, 0, null, 'vertical-jump');
        if (cheatResult.shouldShowRedOverlay) {
            setCheatAlerts(cheatResult.alerts); setShowRedOverlay(true);
            const now = Date.now();
            if (now - lastBeepRef.current > 2000) { playAlertBeep(); lastBeepRef.current = now; }
        } else { setCheatAlerts([]); setShowRedOverlay(false); }

        const hipY = (lm.leftHip.y + lm.rightHip.y) / 2;
        const wristY = Math.min(lm.leftWrist.y, lm.rightWrist.y);

        if (phase === 'calibrating') {
            // Record standing reach (lowest wrist Y = highest reach when arms up)
            if (!standingRef.current || wristY < standingRef.current) {
                standingRef.current = wristY;
            }
            setStandingReach(Math.round((1 - standingRef.current) * 300)); // Approx cm
        }

        if (phase === 'ready') {
            // Detect takeoff — hip moving up significantly
            if (prevHipY.current !== null) {
                const delta = prevHipY.current - hipY;
                if (delta > 0.04) {
                    setPhase('jumping');
                    peakRef.current = hipY;
                }
            }
            prevHipY.current = hipY;
        }

        if (phase === 'jumping') {
            // Track peak (lowest hipY = highest point)
            if (hipY < (peakRef.current || 1)) {
                peakRef.current = hipY;
            }

            // Detect landing — hip starts going down then stabilizes
            if (prevHipY.current !== null && hipY > peakRef.current + 0.03) {
                const jumpPixels = (standingRef.current || 0.5) - peakRef.current;
                const heightCm = Math.round(Math.max(0, jumpPixels * 300));
                const power = Math.round(Math.min(100, (heightCm / 70) * 100)); // 70cm = elite

                setJumpPeak(peakRef.current);
                setJumpHeight(heightCm);
                setPowerScore(power);
                setPhase('landed');
                stabilityFrames.current = [];
            }
            prevHipY.current = hipY;
        }

        if (phase === 'landed') {
            // Track landing stability (hip Y variance over a few frames)
            stabilityFrames.current.push(hipY);
            if (stabilityFrames.current.length >= 15) {
                const avg = stabilityFrames.current.reduce((a, b) => a + b) / stabilityFrames.current.length;
                const variance = stabilityFrames.current.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / stabilityFrames.current.length;
                const stability = Math.round(Math.max(0, Math.min(100, 100 - variance * 10000)));
                setLandingStability(stability);

                setAttempts(prev => [...prev, { height: jumpHeight, power: powerScore, stability }]);
                setBestJump(prev => Math.max(prev, jumpHeight));
                setPhase('idle');
                setShowRedOverlay(false); setCheatAlerts([]);
                setTimeout(() => setShowFeedback(true), 500);
            }
        }
    }, [landmarks, phase, jumpHeight, powerScore]);

    const handleStart = useCallback(async () => {
        if (!isRunning && videoRef.current) await startCamera(videoRef.current, null);
        standingRef.current = null;
        peakRef.current = null;
        prevHipY.current = null;
        setPhase('calibrating');
        setJumpHeight(0);
        setPowerScore(0);
        setLandingStability(0);
    }, [isRunning, startCamera]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
                    🦘 <span className="gradient-text">Vertical Jump Test</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    AI detects your standing reach and jump peak to calculate explosive power.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(250px, 1fr)', gap: '20px' }}>
                    {/* Camera */}
                    <div>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <CameraFeed ref={videoRef} isRunning={isRunning} facingMode={facingMode} onSwitchCamera={switchCamera} />
                            {landmarks && isRunning && <PoseOverlay landmarks={landmarks} formQuality={showRedOverlay ? 'bad' : phase === 'jumping' ? 'good' : 'warning'} />}
                            <CheatAlertOverlay alerts={cheatAlerts} visible={showRedOverlay} />
                        </div>

                        {/* Phase Indicator */}
                        <div className="glass-card" style={{
                            padding: '16px', textAlign: 'center', marginBottom: '16px',
                            border: `2px solid ${phase === 'jumping' ? 'var(--neon-green)' : phase === 'calibrating' ? 'var(--warning-yellow)' : 'var(--glass-border)'}`,
                        }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: phase === 'jumping' ? 'var(--neon-green)' : 'var(--electric-blue)' }}>
                                {phase === 'idle' && '🎯 Press Start to begin'}
                                {phase === 'calibrating' && '📏 Raise both arms high — Calibrating reach...'}
                                {phase === 'ready' && '🦘 Ready — JUMP when ready!'}
                                {phase === 'jumping' && '🚀 JUMPING — Tracking peak height...'}
                                {phase === 'landed' && '📊 Analyzing landing stability...'}
                            </div>
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-primary" onClick={handleStart} disabled={isLoading || (phase !== 'idle')}
                                style={{ flex: 1, padding: '14px', opacity: isLoading || phase !== 'idle' ? 0.5 : 1 }}>
                                {phase === 'calibrating' ? '📏 Calibrating...' : isLoading ? '⏳ Loading...' : '▶ Start Jump Test'}
                            </button>
                            {phase === 'calibrating' && (
                                <button className="btn-secondary" onClick={() => setPhase('ready')} style={{ padding: '14px 24px' }}>
                                    ✅ Reach Set — Ready
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jump Height</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--neon-green)', fontFamily: 'monospace' }}>{jumpHeight}<span style={{ fontSize: '1rem' }}>cm</span></div>
                        </div>
                        <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Power Score</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--electric-blue)' }}>{powerScore}/100</div>
                        </div>
                        <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Landing Stability</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{landingStability}%</div>
                        </div>
                        <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Best Jump</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning-yellow)' }}>{bestJump}cm</div>
                        </div>
                        <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attempts</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{attempts.length}</div>
                        </div>
                    </div>
                </div>

                {/* History */}
                {attempts.length > 0 && (
                    <div className="glass-card" style={{ padding: '20px', marginTop: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>📋 Attempt History</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {attempts.map((a, i) => (
                                <div key={i} className="glass-card" style={{ padding: '12px 16px', textAlign: 'center', minWidth: '120px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Attempt {i + 1}</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--neon-green)' }}>{a.height}cm</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--electric-blue)' }}>Power: {a.power}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
            <FeedbackPopup isOpen={showFeedback} onClose={() => setShowFeedback(false)} testName="Vertical Jump" />
            <style>{`@media(max-width:768px){div[style*="grid-template-columns: minmax(0, 2fr)"]{grid-template-columns:1fr!important}}`}</style>
        </div>
    );
}
