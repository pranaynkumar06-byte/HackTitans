/**
 * BeepTest.jsx
 * MODULE 3: Beep Test / Yo-Yo Test
 * Audio-guided shuttle run test with level tracking and VO2 max estimation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import FeedbackPopup from '../components/FeedbackPopup';
import TrendGraph from '../components/TrendGraph';

// Beep test levels: each level has more shuttles and shorter intervals
const LEVELS = [
    { level: 1, shuttles: 7, speed: 8.0, interval: 9000 },
    { level: 2, shuttles: 8, speed: 9.0, interval: 8000 },
    { level: 3, shuttles: 8, speed: 9.5, interval: 7600 },
    { level: 4, shuttles: 9, speed: 10.0, interval: 7200 },
    { level: 5, shuttles: 9, speed: 10.5, interval: 6860 },
    { level: 6, shuttles: 10, speed: 11.0, interval: 6550 },
    { level: 7, shuttles: 10, speed: 11.5, interval: 6260 },
    { level: 8, shuttles: 11, speed: 12.0, interval: 6000 },
    { level: 9, shuttles: 11, speed: 12.5, interval: 5760 },
    { level: 10, shuttles: 11, speed: 13.0, interval: 5540 },
    { level: 11, shuttles: 12, speed: 13.5, interval: 5330 },
    { level: 12, shuttles: 12, speed: 14.0, interval: 5140 },
    { level: 13, shuttles: 13, speed: 14.5, interval: 4970 },
    { level: 14, shuttles: 13, speed: 15.0, interval: 4800 },
    { level: 15, shuttles: 13, speed: 15.5, interval: 4650 },
];

// VO2 max estimation: Léger formula
function estimateVO2Max(level, shuttle) {
    const speed = 8.0 + (level - 1) * 0.5 + (shuttle / 20);
    return Math.round((speed * 6.65 - 35.8) * 10) / 10;
}

function getEnduranceRating(level) {
    if (level >= 13) return { label: 'Elite', color: 'var(--neon-green)' };
    if (level >= 10) return { label: 'Excellent', color: 'var(--electric-blue)' };
    if (level >= 7) return { label: 'Good', color: 'var(--accent-purple)' };
    if (level >= 5) return { label: 'Average', color: 'var(--warning-yellow)' };
    return { label: 'Below Avg', color: 'var(--danger-red)' };
}

export default function BeepTest() {
    const [isRunning, setIsRunning] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [currentShuttle, setCurrentShuttle] = useState(0);
    const [totalShuttles, setTotalShuttles] = useState(0);
    const [finished, setFinished] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [history] = useState([
        { level: 6, shuttles: 42, vo2: 38.2 },
        { level: 7, shuttles: 51, vo2: 41.5 },
        { level: 7, shuttles: 55, vo2: 42.8 },
        { level: 8, shuttles: 62, vo2: 44.1 },
    ]);
    const [showFeedback, setShowFeedback] = useState(false);

    const timerRef = useRef(null);
    const beepRef = useRef(null);
    const audioCtx = useRef(null);

    function playBeep(freq = 800) {
        try {
            if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.current.createOscillator();
            const gain = audioCtx.current.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.current.destination);
            osc.frequency.value = freq;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(audioCtx.current.currentTime + 0.15);
        } catch { }
    }

    function startTest() {
        setIsRunning(true);
        setCurrentLevel(1);
        setCurrentShuttle(0);
        setTotalShuttles(0);
        setFinished(false);
        setElapsed(0);
        runLevel(1, 0);
    }

    function runLevel(level, shuttle) {
        if (level > LEVELS.length) {
            finishTest(level - 1);
            return;
        }
        const lvl = LEVELS[level - 1];

        // Schedule beeps for each shuttle
        let shuttleCount = shuttle;
        const scheduleNextBeep = () => {
            if (!isRunning && shuttleCount > 0) return;
            playBeep(shuttleCount === 0 ? 1200 : 800);
            shuttleCount++;
            setCurrentShuttle(shuttleCount);
            setTotalShuttles(prev => prev + 1);

            if (shuttleCount >= lvl.shuttles) {
                // Level complete — go to next level
                playBeep(1600); // Double beep
                setCurrentLevel(level + 1);
                setTimeout(() => runLevel(level + 1, 0), 1500);
            } else {
                beepRef.current = setTimeout(scheduleNextBeep, lvl.interval);
            }
        };

        beepRef.current = setTimeout(scheduleNextBeep, 1000);
    }

    function finishTest(level) {
        setIsRunning(false);
        setFinished(true);
        clearTimeout(beepRef.current);
        setTimeout(() => setShowFeedback(true), 800);
    }

    function stopTest() {
        setIsRunning(false);
        setFinished(true);
        clearTimeout(beepRef.current);
        setTimeout(() => setShowFeedback(true), 800);
    }

    // Elapsed timer
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
            return () => clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    const vo2 = estimateVO2Max(currentLevel, currentShuttle);
    const rating = getEnduranceRating(currentLevel);
    const score = Math.round(Math.min(100, (currentLevel / 15) * 100));

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
                    🫀 <span className="gradient-text">Beep Test</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Progressive shuttle run test. Run between markers in time with the beeps. Each level gets faster.
                </p>

                {/* Main Display */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px',
                }}>
                    {/* Level */}
                    <div className="glass-card" style={{
                        padding: '28px', textAlign: 'center',
                        border: isRunning ? '2px solid var(--neon-green)' : '1px solid var(--glass-border)',
                    }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</div>
                        <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--neon-green)', lineHeight: 1, fontFamily: 'monospace' }}>{currentLevel}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>of 15</div>
                    </div>

                    {/* Shuttle */}
                    <div className="glass-card" style={{ padding: '28px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shuttle</div>
                        <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--electric-blue)', lineHeight: 1, fontFamily: 'monospace' }}>{currentShuttle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            of {LEVELS[Math.min(currentLevel - 1, LEVELS.length - 1)]?.shuttles || 0}
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px', marginBottom: '24px',
                }}>
                    <MetricCard label="Total Shuttles" value={totalShuttles} color="var(--neon-green)" />
                    <MetricCard label="VO2 Max Est." value={`${vo2}`} color="var(--electric-blue)" />
                    <MetricCard label="Rating" value={rating.label} color={rating.color} />
                    <MetricCard label="Score" value={`${score}/100`} color="var(--accent-purple)" />
                    <MetricCard label="Time" value={`${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`} color="var(--text-primary)" />
                    <MetricCard label="Speed" value={`${LEVELS[Math.min(currentLevel - 1, LEVELS.length - 1)]?.speed || 0} km/h`} color="var(--warning-yellow)" />
                </div>

                {/* Level Progress Bar */}
                <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Level Progress</span>
                        <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>{currentLevel}/15</span>
                    </div>
                    <div className="progress-bar" style={{ height: '12px' }}>
                        <div className="progress-fill" style={{ width: `${(currentLevel / 15) * 100}%` }} />
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    {!isRunning && !finished && (
                        <button className="btn-primary" onClick={startTest} style={{ flex: 1, padding: '16px', fontSize: '1rem' }}>
                            ▶ Start Beep Test
                        </button>
                    )}
                    {isRunning && (
                        <button className="btn-danger" onClick={stopTest} style={{ flex: 1, padding: '16px', fontSize: '1rem' }}>
                            ⏹ Stop (I can't keep up)
                        </button>
                    )}
                    {finished && (
                        <button className="btn-primary" onClick={startTest} style={{ flex: 1, padding: '16px', fontSize: '1rem' }}>
                            🔄 Restart Test
                        </button>
                    )}
                    {isRunning && (
                        <button className="btn-secondary" onClick={() => {
                            setCurrentLevel(prev => Math.min(prev + 1, 15));
                        }} style={{ padding: '16px 24px' }}>
                            ⏭ Skip Level
                        </button>
                    )}
                </div>

                {/* Finished Summary */}
                {finished && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card" style={{ padding: '28px', textAlign: 'center', marginBottom: '24px', border: '2px solid var(--neon-green)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏆</div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>Test Complete!</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                            <div><div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--neon-green)' }}>Lv.{currentLevel}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Final Level</div></div>
                            <div><div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--electric-blue)' }}>{vo2}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VO2 Max</div></div>
                            <div><div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-purple)' }}>{totalShuttles}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Shuttles</div></div>
                        </div>
                    </motion.div>
                )}

                {/* History */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>📈 Endurance Progress</h3>
                    <TrendGraph data={history.map(h => h.vo2)} labels={history.map((_, i) => `Test ${i + 1}`)} height={160} />
                </div>
            </motion.div>
            <FeedbackPopup isOpen={showFeedback} onClose={() => setShowFeedback(false)} testName="Beep Test" />
        </div>
    );
}

function MetricCard({ label, value, color }) {
    return (
        <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
        </div>
    );
}
