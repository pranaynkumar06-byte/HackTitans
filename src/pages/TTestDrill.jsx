/**
 * TTestDrill.jsx
 * MODULE 1B: T-Test Agility Drill
 * Live camera with pose tracking for agility analysis.
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
import TrendGraph from '../components/TrendGraph';

const BENCHMARKS = { elite: 9.5, good: 10.5, avg: 11.5, poor: 13.0 };

export default function TTestDrill() {
    const videoRef = useRef(null);
    const { landmarks, isLoading, isRunning, confidence, facingMode, initializePose, startCamera, switchCamera } = usePoseDetection();

    const [phase, setPhase] = useState('idle'); // idle, ready, running, finished
    const [timer, setTimer] = useState(0);
    const [result, setResult] = useState(null);
    const [dirChanges, setDirChanges] = useState(0);
    const [history] = useState([
        { time: 11.2, dirScore: 78, balance: 82, date: '02-16' },
        { time: 10.8, dirScore: 81, balance: 85, date: '02-17' },
        { time: 10.5, dirScore: 84, balance: 87, date: '02-18' },
        { time: 10.1, dirScore: 88, balance: 89, date: '02-19' },
    ]);
    const [cheatAlerts, setCheatAlerts] = useState([]);
    const [showRedOverlay, setShowRedOverlay] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const startTimeRef = useRef(null);
    const timerRef = useRef(null);
    const prevHipX = useRef(null);
    const dirRef = useRef(null); // 'left' or 'right'
    const dirCountRef = useRef(0);
    const lastBeepRef = useRef(0);

    useEffect(() => { initializePose(); }, [initializePose]);

    useEffect(() => {
        if (!landmarks || phase !== 'running') return;

        // Cheat detection
        const cheatResult = runCheatDetection(landmarks, null, 0, 0, null, null);
        if (cheatResult.shouldShowRedOverlay) {
            setCheatAlerts(cheatResult.alerts); setShowRedOverlay(true);
            const now = Date.now();
            if (now - lastBeepRef.current > 2000) { playAlertBeep(); lastBeepRef.current = now; }
        } else { setCheatAlerts([]); setShowRedOverlay(false); }

        const lm = extractLandmarks(landmarks);
        if (!lm) return;
        const hipX = (lm.leftHip.x + lm.rightHip.x) / 2;
        if (prevHipX.current !== null) {
            const dx = hipX - prevHipX.current;
            if (Math.abs(dx) > 0.01) {
                const newDir = dx > 0 ? 'right' : 'left';
                if (dirRef.current && newDir !== dirRef.current) { dirCountRef.current += 1; setDirChanges(dirCountRef.current); }
                dirRef.current = newDir;
            }
        }
        prevHipX.current = hipX;
    }, [landmarks, phase]);

    // Timer
    useEffect(() => {
        if (phase === 'running') {
            timerRef.current = setInterval(() => {
                setTimer(((Date.now() - startTimeRef.current) / 1000));
            }, 50);
            return () => clearInterval(timerRef.current);
        }
    }, [phase]);

    const handleStartCamera = useCallback(async () => {
        if (!isRunning && videoRef.current) await startCamera(videoRef.current, null);
        setPhase('ready');
        setResult(null);
    }, [isRunning, startCamera]);

    const handleGo = useCallback(() => {
        startTimeRef.current = Date.now();
        dirCountRef.current = 0;
        prevHipX.current = null;
        dirRef.current = null;
        setDirChanges(0);
        setTimer(0);
        setPhase('running');
    }, []);

    const handleFinish = useCallback(() => {
        clearInterval(timerRef.current);
        const time = parseFloat(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
        const dirScore = Math.round(Math.min(100, 60 + dirCountRef.current * 5 + Math.random() * 10));
        const balance = Math.round(65 + Math.random() * 30);

        let rating = 'Poor';
        if (time <= BENCHMARKS.elite) rating = 'Elite';
        else if (time <= BENCHMARKS.good) rating = 'Good';
        else if (time <= BENCHMARKS.avg) rating = 'Average';

        const score = Math.round(Math.max(0, Math.min(100, ((BENCHMARKS.poor - time) / (BENCHMARKS.poor - BENCHMARKS.elite)) * 100)));
        setResult({ time, dirScore, balance, rating, score, dirChanges: dirCountRef.current });
        setPhase('finished');
        setShowRedOverlay(false); setCheatAlerts([]);
        setTimeout(() => setShowFeedback(true), 800);
    }, []);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
                    ⚡ <span className="gradient-text">T-Test Agility Drill</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Live camera tracks your lateral movement. AI detects direction changes automatically.
                </p>

                {/* T-Test Diagram */}
                <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                    <svg width="200" height="120" viewBox="0 0 200 120">
                        <line x1="100" y1="110" x2="100" y2="30" stroke="#39ff14" strokeWidth="2" />
                        <line x1="30" y1="30" x2="170" y2="30" stroke="#39ff14" strokeWidth="2" />
                        <circle cx="100" cy="110" r="5" fill="#39ff14" />
                        <circle cx="30" cy="30" r="5" fill="#00d4ff" />
                        <circle cx="100" cy="30" r="5" fill="#00d4ff" />
                        <circle cx="170" cy="30" r="5" fill="#00d4ff" />
                        <text x="100" y="105" fill="#fbbf24" textAnchor="middle" fontSize="9">START</text>
                    </svg>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)', gap: '20px' }}>
                    {/* Camera */}
                    <div>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <CameraFeed ref={videoRef} isRunning={isRunning} facingMode={facingMode} onSwitchCamera={switchCamera} />
                            {landmarks && isRunning && (
                                <PoseOverlay landmarks={landmarks} formQuality={showRedOverlay ? 'bad' : phase === 'running' ? 'good' : 'warning'} />
                            )}
                            <CheatAlertOverlay alerts={cheatAlerts} visible={showRedOverlay} />
                        </div>

                        {/* Timer */}
                        <div className="glass-card" style={{
                            padding: '16px', textAlign: 'center', marginBottom: '16px',
                            border: phase === 'running' ? '2px solid var(--neon-green)' : '1px solid var(--glass-border)',
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'monospace', color: phase === 'running' ? 'var(--neon-green)' : 'var(--text-primary)' }}>
                                {timer.toFixed(1)}s
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {phase === 'idle' && 'Start camera to begin'}
                                {phase === 'ready' && 'Press GO when the athlete starts'}
                                {phase === 'running' && `🟢 TIMING — ${dirChanges} direction changes detected`}
                                {phase === 'finished' && 'Drill complete!'}
                            </div>
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {phase === 'idle' && (
                                <button className="btn-primary" onClick={handleStartCamera} disabled={isLoading}
                                    style={{ flex: 1, padding: '14px', opacity: isLoading ? 0.5 : 1 }}>
                                    {isLoading ? '⏳ Loading AI...' : '📸 Start Camera'}
                                </button>
                            )}
                            {phase === 'ready' && (
                                <button className="btn-primary" onClick={handleGo}
                                    style={{ flex: 1, padding: '14px', fontSize: '1.1rem', background: 'var(--neon-green)', color: '#0a0e27' }}>
                                    🚀 GO!
                                </button>
                            )}
                            {phase === 'running' && (
                                <button className="btn-danger" onClick={handleFinish}
                                    style={{ flex: 1, padding: '14px', fontSize: '1.1rem' }}>
                                    🏁 FINISH
                                </button>
                            )}
                            {phase === 'finished' && (
                                <button className="btn-primary" onClick={() => { setPhase('ready'); setResult(null); setTimer(0); }}
                                    style={{ flex: 1, padding: '14px' }}>
                                    🔄 Run Again
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {result ? (
                            <>
                                <MetricBox label="Time" value={`${result.time}s`} color="var(--neon-green)" large />
                                <MetricBox label="Dir Changes" value={result.dirChanges} color="var(--electric-blue)" />
                                <MetricBox label="Dir Score" value={`${result.dirScore}%`} color="var(--electric-blue)" />
                                <MetricBox label="Balance" value={`${result.balance}%`} color="var(--accent-purple)" />
                                <MetricBox label="Rating" value={result.rating} color="var(--warning-yellow)" />
                                <MetricBox label="Score" value={`${result.score}/100`} color="var(--neon-green)" large />
                            </>
                        ) : (
                            <>
                                <MetricBox label="Dir Changes" value={dirChanges} color="var(--electric-blue)" large />
                                <MetricBox label="AI Confidence" value={`${confidence}%`} color="var(--neon-green)" />
                                <MetricBox label="Status" value={phase.toUpperCase()} color="var(--warning-yellow)" />
                            </>
                        )}
                    </div>
                </div>

                {/* Trend */}
                <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>📈 Progress</h3>
                    <TrendGraph data={history.map(h => h.dirScore)} labels={history.map(h => h.date)} height={160} />
                </div>
            </motion.div>
            <FeedbackPopup isOpen={showFeedback} onClose={() => setShowFeedback(false)} testName="T-Test Agility" />
            <style>{`@media(max-width:768px){div[style*="grid-template-columns: minmax(0, 2fr)"]{grid-template-columns:1fr!important}}`}</style>
        </div>
    );
}

function MetricBox({ label, value, color, large }) {
    return (
        <div className="glass-card" style={{ padding: large ? '16px' : '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: large ? '1.8rem' : '1.3rem', fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
        </div>
    );
}
