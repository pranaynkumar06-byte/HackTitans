/**
 * PushUpTest.jsx
 * MODULE 2A: Push-Up Test (1 Minute)
 * Pose-based rep counting with form accuracy, fatigue tracking,
 * cheat/malpractice detection with red overlay + beep, and feedback popup.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import CameraFeed from '../components/CameraFeed';
import PoseOverlay from '../components/PoseOverlay';
import CheatAlertOverlay from '../components/CheatAlertOverlay';
import FeedbackPopup from '../components/FeedbackPopup';
import usePoseDetection from '../hooks/usePoseDetection';
import { calculateAngle, extractLandmarks } from '../utils/calculateAngle';
import { runCheatDetection, playAlertBeep } from '../utils/cheatDetection';
import TrendGraph from '../components/TrendGraph';

export default function PushUpTest() {
    const videoRef = useRef(null);
    const { landmarks, isLoading, isRunning, confidence, facingMode, initializePose, startCamera, stopCamera, switchCamera } = usePoseDetection();

    const [isActive, setIsActive] = useState(false);
    const [reps, setReps] = useState(0);
    const [incompleteReps, setIncompleteReps] = useState(0);
    const [formScore, setFormScore] = useState(100);
    const [timer, setTimer] = useState(60);
    const [phase, setPhase] = useState('idle');
    const [repTimes, setRepTimes] = useState([]);
    const [finished, setFinished] = useState(false);
    const [cheatAlerts, setCheatAlerts] = useState([]);
    const [showRedOverlay, setShowRedOverlay] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const phaseRef = useRef('idle');
    const timerRef = useRef(null);
    const formScoresRef = useRef([]);
    const lastBeepRef = useRef(0);

    useEffect(() => { initializePose(); }, [initializePose]);

    // Timer countdown
    useEffect(() => {
        if (isActive && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) { handleStop(); return 0; }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [isActive]);

    // Process frames for push-up detection + cheat detection
    useEffect(() => {
        if (!landmarks || !isActive) return;
        const lm = extractLandmarks(landmarks);
        if (!lm) return;

        // --- Cheat Detection ---
        const cheatResult = runCheatDetection(landmarks, null, 0, 0, null, 'pushups');
        if (cheatResult.shouldShowRedOverlay) {
            setCheatAlerts(cheatResult.alerts);
            setShowRedOverlay(true);
            // Play beep (throttle to once per 2 seconds)
            const now = Date.now();
            if (now - lastBeepRef.current > 2000) {
                playAlertBeep();
                lastBeepRef.current = now;
            }
        } else {
            setCheatAlerts([]);
            setShowRedOverlay(false);
        }

        // --- Push-up detection ---
        const leftElbowAngle = calculateAngle(lm.leftShoulder, lm.leftElbow, lm.leftWrist);
        const rightElbowAngle = calculateAngle(lm.rightShoulder, lm.rightElbow, lm.rightWrist);
        const avgElbow = (leftElbowAngle + rightElbowAngle) / 2;
        const bodyAngle = calculateAngle(lm.leftShoulder, lm.leftHip, lm.leftAnkle);
        const bodyAligned = bodyAngle > 150;

        const isDown = avgElbow < 100;
        const isUp = avgElbow > 155;

        if (phaseRef.current === 'idle' && isUp) {
            phaseRef.current = 'up'; setPhase('up');
        } else if (phaseRef.current === 'up' && isDown) {
            phaseRef.current = 'down'; setPhase('down');
        } else if (phaseRef.current === 'down' && isUp) {
            phaseRef.current = 'up'; setPhase('up');
            const repForm = bodyAligned ? (avgElbow > 160 ? 95 : 80) : 55;
            formScoresRef.current.push(repForm);

            if (repForm > 50) {
                setReps(prev => prev + 1);
                setRepTimes(prev => [...prev, Date.now()]);
            } else {
                setIncompleteReps(prev => prev + 1);
            }

            const avgForm = Math.round(formScoresRef.current.reduce((a, b) => a + b, 0) / formScoresRef.current.length);
            setFormScore(avgForm);
        }
    }, [landmarks, isActive]);

    const handleStart = useCallback(async () => {
        if (!isRunning && videoRef.current) await startCamera(videoRef.current, null);
        setReps(0); setIncompleteReps(0); setFormScore(100); setTimer(60);
        setPhase('idle'); setFinished(false); setRepTimes([]);
        phaseRef.current = 'idle'; formScoresRef.current = [];
        setIsActive(true);
    }, [isRunning, startCamera]);

    const handleStop = useCallback(() => {
        setIsActive(false);
        clearInterval(timerRef.current);
        setFinished(true);
        setShowRedOverlay(false);
        setCheatAlerts([]);
        // Show feedback popup after a brief delay
        setTimeout(() => setShowFeedback(true), 800);
    }, []);

    const fatigueRate = (() => {
        if (repTimes.length < 4) return 0;
        const mid = repTimes[0] + 30000;
        const firstHalf = repTimes.filter(t => t < mid).length;
        const secondHalf = repTimes.filter(t => t >= mid).length;
        if (firstHalf === 0) return 0;
        return Math.round(((firstHalf - secondHalf) / firstHalf) * 100);
    })();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
                    💪 <span className="gradient-text">Push-Up Test</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    1-minute timed push-up test with AI rep counting and form analysis.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(250px, 1fr)', gap: '20px' }}>
                    {/* Camera */}
                    <div>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <CameraFeed ref={videoRef} isRunning={isRunning} facingMode={facingMode} onSwitchCamera={switchCamera} />
                            {landmarks && isRunning && <PoseOverlay landmarks={landmarks} formQuality={showRedOverlay ? 'bad' : formScore > 70 ? 'good' : formScore > 40 ? 'warning' : 'bad'} />}
                            <CheatAlertOverlay alerts={cheatAlerts} visible={showRedOverlay} />
                        </div>

                        {/* Timer */}
                        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'monospace', color: timer <= 10 ? 'var(--danger-red)' : 'var(--neon-green)' }}>
                                {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                            </div>
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {!isActive ? (
                                <button className="btn-primary" onClick={handleStart} disabled={isLoading}
                                    style={{ flex: 1, padding: '14px', opacity: isLoading ? 0.5 : 1 }}>
                                    {isLoading ? '⏳ Loading...' : '▶ Start 1-Min Test'}
                                </button>
                            ) : (
                                <button className="btn-danger" onClick={handleStop} style={{ flex: 1, padding: '14px' }}>
                                    ⏹ Stop
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <MetricBox label="Total Reps" value={reps} color="var(--neon-green)" large />
                        <MetricBox label="Incomplete" value={incompleteReps} color="var(--danger-red)" />
                        <MetricBox label="Form Accuracy" value={`${formScore}%`} color="var(--electric-blue)" />
                        <MetricBox label="Fatigue Drop" value={`${fatigueRate}%`} color="var(--warning-yellow)" />
                        <MetricBox label="AI Confidence" value={`${confidence}%`} color="var(--accent-purple)" />
                        <div className="glass-card" style={{
                            padding: '12px', textAlign: 'center',
                            borderColor: phase === 'down' ? 'var(--neon-green)' : 'var(--glass-border)',
                        }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Phase</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--electric-blue)', textTransform: 'uppercase' }}>{phase}</div>
                        </div>
                    </div>
                </div>

                {/* Results after test */}
                {finished && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card"
                        style={{ padding: '24px', marginTop: '24px', textAlign: 'center', border: '2px solid var(--neon-green)' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>🏆 Test Complete!</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            <div><div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-green)' }}>{reps}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valid Reps</div></div>
                            <div><div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--electric-blue)' }}>{formScore}%</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Form Score</div></div>
                            <div><div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--warning-yellow)' }}>{fatigueRate}%</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fatigue Drop</div></div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Feedback Popup */}
            <FeedbackPopup isOpen={showFeedback} onClose={() => setShowFeedback(false)} testName="Push-Up Test" />

            <style>{`@media(max-width:768px){div[style*="grid-template-columns: minmax(0, 2fr)"]{grid-template-columns:1fr!important}}`}</style>
        </div>
    );
}

function MetricBox({ label, value, color, large }) {
    return (
        <div className="glass-card" style={{ padding: large ? '16px' : '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: large ? '2rem' : '1.3rem', fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
        </div>
    );
}
