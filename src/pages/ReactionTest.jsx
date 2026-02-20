/**
 * ReactionTest.jsx
 * MODULE 5: Web-Based Reaction Time Tests
 * Three interactive games: Color Reaction, Moving Target, Decision Reaction.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackPopup from '../components/FeedbackPopup';

const GAMES = [
    { id: 'color', name: 'Color Reaction', icon: '🎨', desc: 'Tap when the color changes to green' },
    { id: 'target', name: 'Moving Target', icon: '🎯', desc: 'Click the moving dot as fast as you can' },
    { id: 'decision', name: 'Decision Game', icon: '🧩', desc: 'Tap only the correct shape — ignore distractors' },
];

export default function ReactionTest() {
    const [game, setGame] = useState('color');
    const [results, setResults] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const feedbackTriggered = useRef(0);

    const avgReaction = results.length > 0
        ? Math.round(results.reduce((s, r) => s + r.time, 0) / results.length)
        : 0;
    const bestReaction = results.length > 0
        ? Math.min(...results.map(r => r.time))
        : 0;
    const accuracyRate = results.length > 0
        ? Math.round((results.filter(r => r.correct).length / results.length) * 100)
        : 0;

    function getRating(ms) {
        if (ms < 200) return { label: 'Elite', color: 'var(--neon-green)' };
        if (ms < 280) return { label: 'Fast', color: 'var(--electric-blue)' };
        if (ms < 350) return { label: 'Average', color: 'var(--warning-yellow)' };
        return { label: 'Slow', color: 'var(--danger-red)' };
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
                    🧠 <span className="gradient-text">Reaction Time Test</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Test your reflexes with three interactive games. Track reaction time in milliseconds.
                </p>

                {/* Game Selector */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {GAMES.map(g => (
                        <button key={g.id}
                            className={g.id === game ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => { setGame(g.id); setResults([]); }}
                            style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                            {g.icon} {g.name}
                        </button>
                    ))}
                </div>

                {/* Metrics Bar */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '10px', marginBottom: '24px',
                }}>
                    <MiniMetric label="Avg Reaction" value={`${avgReaction}ms`} color={avgReaction > 0 ? getRating(avgReaction).color : 'var(--text-muted)'} />
                    <MiniMetric label="Best" value={`${bestReaction}ms`} color="var(--neon-green)" />
                    <MiniMetric label="Accuracy" value={`${accuracyRate}%`} color="var(--electric-blue)" />
                    <MiniMetric label="Attempts" value={results.length} color="var(--text-primary)" />
                    {avgReaction > 0 && <MiniMetric label="Rating" value={getRating(avgReaction).label} color={getRating(avgReaction).color} />}
                </div>

                {/* Game Area */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
                    {game === 'color' && <ColorReactionGame onResult={(r) => setResults(prev => [...prev, r])} />}
                    {game === 'target' && <MovingTargetGame onResult={(r) => setResults(prev => [...prev, r])} />}
                    {game === 'decision' && <DecisionGame onResult={(r) => setResults(prev => [...prev, r])} />}
                </div>

                {/* Recent Results */}
                {results.length > 0 && (
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Recent Results</h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {results.slice(-12).map((r, i) => (
                                <div key={i} className="glass-card" style={{
                                    padding: '8px 14px', textAlign: 'center', minWidth: '70px',
                                    borderColor: r.correct ? 'rgba(57,255,20,0.3)' : 'rgba(255,59,92,0.3)',
                                }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 800, color: r.correct ? getRating(r.time).color : 'var(--danger-red)' }}>
                                        {r.time}ms
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                        {r.correct ? '✓' : '✗'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
            <FeedbackPopup isOpen={showFeedback} onClose={() => setShowFeedback(false)} testName="Reaction Time" />
        </div>
    );
}

// ===== GAME 1: COLOR REACTION =====
function ColorReactionGame({ onResult }) {
    const [state, setState] = useState('waiting'); // waiting, ready, go, result, tooEarly
    const [reactionTime, setReactionTime] = useState(0);
    const timerRef = useRef(null);
    const startRef = useRef(0);

    function startRound() {
        setState('ready');
        const delay = 1500 + Math.random() * 3000;
        timerRef.current = setTimeout(() => {
            setState('go');
            startRef.current = Date.now();
        }, delay);
    }

    function handleClick() {
        if (state === 'waiting') {
            startRound();
        } else if (state === 'ready') {
            clearTimeout(timerRef.current);
            setState('tooEarly');
        } else if (state === 'go') {
            const time = Date.now() - startRef.current;
            setReactionTime(time);
            setState('result');
            onResult({ time, correct: true });
        } else if (state === 'result' || state === 'tooEarly') {
            startRound();
        }
    }

    const colors = { waiting: '#1a1f4a', ready: '#cc2244', go: '#39ff14', result: '#1a1f4a', tooEarly: '#fbbf24' };
    const messages = {
        waiting: 'Click to Start',
        ready: 'Wait for GREEN...',
        go: 'CLICK NOW!',
        result: `${reactionTime}ms — Click to retry`,
        tooEarly: 'Too early! Click to retry',
    };

    return (
        <div onClick={handleClick} style={{
            background: colors[state], height: '300px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'background 0.1s', userSelect: 'none',
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: state === 'go' ? '#0a0e27' : '#fff' }}>
                    {messages[state]}
                </div>
                {state === 'result' && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {reactionTime < 200 ? '⚡ Incredible!' : reactionTime < 300 ? '👍 Good!' : '🏃 Keep practicing'}
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== GAME 2: MOVING TARGET =====
function MovingTargetGame({ onResult }) {
    const [target, setTarget] = useState(null);
    const [round, setRound] = useState(0);
    const startRef = useRef(0);
    const containerRef = useRef(null);

    function spawnTarget() {
        const x = 10 + Math.random() * 80;
        const y = 10 + Math.random() * 80;
        setTarget({ x, y });
        startRef.current = Date.now();
        setRound(prev => prev + 1);
    }

    function handleTargetClick(e) {
        e.stopPropagation();
        const time = Date.now() - startRef.current;
        onResult({ time, correct: true });
        setTarget(null);
        setTimeout(spawnTarget, 500);
    }

    useEffect(() => {
        const timer = setTimeout(spawnTarget, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Auto-expire target after 3 seconds
    useEffect(() => {
        if (!target) return;
        const timer = setTimeout(() => {
            onResult({ time: 3000, correct: false });
            setTarget(null);
            setTimeout(spawnTarget, 500);
        }, 3000);
        return () => clearTimeout(timer);
    }, [target, round]);

    return (
        <div ref={containerRef} style={{
            height: '300px', position: 'relative', background: '#0a0e27',
            cursor: 'crosshair', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Round: {round}
            </div>
            <AnimatePresence>
                {target && (
                    <motion.div
                        key={round}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={handleTargetClick}
                        style={{
                            position: 'absolute',
                            left: `${target.x}%`,
                            top: `${target.y}%`,
                            width: '40px', height: '40px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--neon-green), var(--neon-green-dim))',
                            boxShadow: '0 0 20px rgba(57,255,20,0.5)',
                            cursor: 'pointer',
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                )}
            </AnimatePresence>
            {!target && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    Get ready...
                </div>
            )}
        </div>
    );
}

// ===== GAME 3: DECISION GAME =====
function DecisionGame({ onResult }) {
    const [shapes, setShapes] = useState([]);
    const [targetShape, setTargetShape] = useState('circle');
    const [round, setRound] = useState(0);
    const startRef = useRef(0);

    const SHAPE_TYPES = ['circle', 'square', 'triangle'];
    const SHAPE_COLORS = ['#39ff14', '#00d4ff', '#ff3b5c', '#fbbf24', '#a855f7'];

    function startRound() {
        const target = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
        setTargetShape(target);

        // Generate 4-6 shapes including at least 1 target
        const count = 4 + Math.floor(Math.random() * 3);
        const newShapes = [];
        const targetIdx = Math.floor(Math.random() * count);

        for (let i = 0; i < count; i++) {
            const isTarget = i === targetIdx;
            newShapes.push({
                id: i,
                type: isTarget ? target : SHAPE_TYPES.filter(s => s !== target)[Math.floor(Math.random() * 2)],
                isTarget,
                x: 10 + Math.random() * 80,
                y: 10 + Math.random() * 80,
                color: SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)],
            });
        }

        setShapes(newShapes);
        startRef.current = Date.now();
        setRound(prev => prev + 1);
    }

    function handleShapeClick(shape) {
        const time = Date.now() - startRef.current;
        onResult({ time, correct: shape.isTarget });
        setShapes([]);
        setTimeout(startRound, 800);
    }

    useEffect(() => { startRound(); }, []);

    function renderShape(shape) {
        const size = 36;
        if (shape.type === 'circle') {
            return <div style={{ width: size, height: size, borderRadius: '50%', background: shape.color }} />;
        }
        if (shape.type === 'square') {
            return <div style={{ width: size, height: size, borderRadius: '4px', background: shape.color }} />;
        }
        return (
            <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${shape.color}` }} />
        );
    }

    return (
        <div style={{ height: '300px', position: 'relative', background: '#0a0e27', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
                padding: '6px 16px', borderRadius: '20px', background: 'rgba(57,255,20,0.15)',
                border: '1px solid rgba(57,255,20,0.3)', fontSize: '0.8rem', fontWeight: 600, zIndex: 10,
            }}>
                Find the <span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>{targetShape}</span>!
            </div>

            <AnimatePresence>
                {shapes.map((shape) => (
                    <motion.div
                        key={`${round}-${shape.id}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => handleShapeClick(shape)}
                        style={{
                            position: 'absolute',
                            left: `${shape.x}%`,
                            top: `${shape.y}%`,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            padding: '8px',
                        }}
                    >
                        {renderShape(shape)}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

function MiniMetric({ label, value, color }) {
    return (
        <div className="glass-card" style={{ padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
        </div>
    );
}
