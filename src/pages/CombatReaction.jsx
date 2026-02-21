/**
 * CombatReaction.jsx
 * MODULE 6: Taekwondo / Boxing Reaction Speed
 * Three modes: Punch Speed Detection, Kick Height Analysis, Reaction Challenge.
 * Uses MediaPipe Pose for real-time body tracking.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import usePoseDetection from '../hooks/usePoseDetection';
import PoseOverlay from '../components/PoseOverlay';
import { extractLandmarks, calculateDistance } from '../utils/calculateAngle';
import FeedbackPopup from '../components/FeedbackPopup';

const MODES = [
    { id: 'punch', name: 'Punch Speed', icon: '🥊', desc: 'Detect punch speed using wrist tracking' },
    { id: 'kick', name: 'Kick Height', icon: '🦵', desc: 'Measure kick height relative to body' },
    { id: 'challenge', name: 'Reaction Challenge', icon: '🎯', desc: 'React to on-screen combat prompts' },
];

// ═══════ MAIN COMPONENT ═══════
export default function CombatReaction() {
    const [mode, setMode] = useState('punch');
    const [results, setResults] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);

    const addResult = useCallback((r) => setResults(prev => [...prev, r]), []);

    // Aggregate stats
    const punchSpeeds = results.filter(r => r.type === 'punch');
    const kickHeights = results.filter(r => r.type === 'kick');
    const reactions = results.filter(r => r.type === 'reaction');

    const avgPunchSpeed = punchSpeeds.length > 0
        ? (punchSpeeds.reduce((s, r) => s + r.value, 0) / punchSpeeds.length).toFixed(1)
        : '—';
    const bestPunchSpeed = punchSpeeds.length > 0
        ? Math.max(...punchSpeeds.map(r => r.value)).toFixed(1)
        : '—';
    const avgKickHeight = kickHeights.length > 0
        ? Math.round(kickHeights.reduce((s, r) => s + r.value, 0) / kickHeights.length)
        : '—';
    const bestKickHeight = kickHeights.length > 0
        ? Math.max(...kickHeights.map(r => r.value))
        : '—';
    const avgReaction = reactions.length > 0
        ? Math.round(reactions.reduce((s, r) => s + r.value, 0) / reactions.length)
        : '—';
    const bestReaction = reactions.length > 0
        ? Math.min(...reactions.map(r => r.value))
        : '—';

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
                    🥊 <span className="gradient-text">Combat Reaction Speed</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Taekwondo & Boxing — punch speed, kick height, and reaction challenges using AI pose detection.
                </p>

                {/* Mode Selector */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {MODES.map(m => (
                        <button key={m.id}
                            className={m.id === mode ? 'btn-primary' : 'btn-secondary'}
                            onClick={() => { setMode(m.id); setResults([]); }}
                            style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                            {m.icon} {m.name}
                        </button>
                    ))}
                </div>

                {/* Metrics Bar */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '10px', marginBottom: '24px',
                }}>
                    {mode === 'punch' && <>
                        <MiniMetric label="Avg Speed" value={`${avgPunchSpeed} m/s`} color="var(--neon-green)" />
                        <MiniMetric label="Best Speed" value={`${bestPunchSpeed} m/s`} color="var(--electric-blue)" />
                        <MiniMetric label="Punches" value={punchSpeeds.length} color="var(--text-primary)" />
                    </>}
                    {mode === 'kick' && <>
                        <MiniMetric label="Avg Height" value={`${avgKickHeight}%`} color="var(--neon-green)" />
                        <MiniMetric label="Best Height" value={`${bestKickHeight}%`} color="var(--electric-blue)" />
                        <MiniMetric label="Kicks" value={kickHeights.length} color="var(--text-primary)" />
                    </>}
                    {mode === 'challenge' && <>
                        <MiniMetric label="Avg Reaction" value={`${avgReaction}ms`} color="var(--neon-green)" />
                        <MiniMetric label="Best" value={`${bestReaction}ms`} color="var(--electric-blue)" />
                        <MiniMetric label="Rounds" value={reactions.length} color="var(--text-primary)" />
                        {typeof avgReaction === 'number' && <MiniMetric label="Rating" value={getRating(avgReaction).label} color={getRating(avgReaction).color} />}
                    </>}
                </div>

                {/* Mode Content */}
                <div className="glass-card" style={{
                    padding: '0', overflow: 'hidden', marginBottom: '24px',
                    background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                }}>
                    {mode === 'punch' && <PunchSpeedMode onResult={addResult} />}
                    {mode === 'kick' && <KickHeightMode onResult={addResult} />}
                    {mode === 'challenge' && <ReactionChallengeMode onResult={addResult} />}
                </div>

                {/* Recent Results */}
                {results.length > 0 && (
                    <div className="glass-card" style={{
                        padding: '20px',
                        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                    }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Recent Results</h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {results.slice(-12).map((r, i) => (
                                <div key={i} className="glass-card" style={{
                                    padding: '8px 14px', textAlign: 'center', minWidth: '80px',
                                }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--neon-green)' }}>
                                        {r.type === 'punch' ? `${r.value.toFixed(1)} m/s` :
                                            r.type === 'kick' ? `${r.value}%` :
                                                `${r.value}ms`}
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        {r.label || r.type}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
            <FeedbackPopup isOpen={showFeedback} onClose={() => setShowFeedback(false)} testName="Combat Reaction" />
        </div>
    );
}

function getRating(ms) {
    if (ms < 200) return { label: 'Elite', color: 'var(--neon-green)' };
    if (ms < 280) return { label: 'Fast', color: 'var(--electric-blue)' };
    if (ms < 350) return { label: 'Average', color: 'var(--warning-yellow)' };
    return { label: 'Slow', color: 'var(--danger-red)' };
}

// ═══════ MODE 1: PUNCH SPEED ═══════
function PunchSpeedMode({ onResult }) {
    const pose = usePoseDetection();
    const videoRef = useRef(null);
    const [started, setStarted] = useState(false);
    const [lastPunch, setLastPunch] = useState(null);
    const [feedback, setFeedback] = useState('Stand in frame, then throw a punch!');

    // Velocity tracking
    const prevWristRef = useRef({ left: null, right: null, time: 0 });
    const punchStateRef = useRef('idle'); // idle, punching
    const punchStartRef = useRef(null);
    const maxVelocityRef = useRef(0);

    // Start camera
    const handleStart = async () => {
        await pose.initializePose();
        if (videoRef.current) {
            await pose.startCamera(videoRef.current, null);
            setStarted(true);
            setFeedback('Camera active — throw a punch!');
        }
    };

    // Process landmarks each frame
    useEffect(() => {
        if (!pose.landmarks || !started) return;
        const lm = extractLandmarks(pose.landmarks);
        if (!lm) return;

        const now = performance.now();
        const dt = prevWristRef.current.time > 0 ? (now - prevWristRef.current.time) / 1000 : 0;

        if (dt > 0 && dt < 0.2) {
            // Calculate wrist velocities (normalized coords → approximate m/s)
            // Assume camera FOV ≈ 1.5m width at arm's length
            const SCALE = 1.5; // meters per normalized unit
            const FPS_FACTOR = 1 / dt;

            const leftVel = prevWristRef.current.left
                ? calculateDistance(lm.leftWrist, prevWristRef.current.left) * SCALE * FPS_FACTOR
                : 0;
            const rightVel = prevWristRef.current.right
                ? calculateDistance(lm.rightWrist, prevWristRef.current.right) * SCALE * FPS_FACTOR
                : 0;

            const maxVel = Math.max(leftVel, rightVel);
            const hand = leftVel > rightVel ? 'Left' : 'Right';

            // Punch detection state machine
            const PUNCH_START_THRESHOLD = 2.0; // m/s to start detecting
            const PUNCH_END_THRESHOLD = 0.8;   // m/s to end

            if (punchStateRef.current === 'idle' && maxVel > PUNCH_START_THRESHOLD) {
                punchStateRef.current = 'punching';
                punchStartRef.current = now;
                maxVelocityRef.current = maxVel;
                setFeedback(`${hand} punch detected...`);
            } else if (punchStateRef.current === 'punching') {
                maxVelocityRef.current = Math.max(maxVelocityRef.current, maxVel);

                if (maxVel < PUNCH_END_THRESHOLD) {
                    // Punch ended
                    const punchDuration = (now - punchStartRef.current) / 1000;
                    const speed = Math.round(maxVelocityRef.current * 10) / 10;

                    if (punchDuration < 1.0 && speed > 1.5) {
                        const result = {
                            type: 'punch',
                            value: speed,
                            label: `${hand} ${speed > 5 ? '💥' : '👊'}`,
                            duration: Math.round(punchDuration * 1000),
                        };
                        onResult(result);
                        setLastPunch(result);
                        setFeedback(`${hand} punch: ${speed} m/s in ${Math.round(punchDuration * 1000)}ms!`);
                    }

                    punchStateRef.current = 'idle';
                    maxVelocityRef.current = 0;
                }
            }
        }

        prevWristRef.current = {
            left: { ...lm.leftWrist },
            right: { ...lm.rightWrist },
            time: now,
        };
    }, [pose.landmarks, started]);

    return (
        <div style={{ position: 'relative' }}>
            {/* Camera view */}
            <div style={{
                position: 'relative', width: '100%', aspectRatio: '4/3',
                background: '#111', overflow: 'hidden',
            }}>
                <video ref={videoRef} playsInline muted style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transform: 'scaleX(-1)', display: started ? 'block' : 'none',
                }} />

                {started && pose.landmarks && (
                    <PoseOverlay landmarks={pose.landmarks} formQuality="good" width={640} height={480} />
                )}

                {!started && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '16px',
                    }}>
                        <div style={{ fontSize: '3rem' }}>🥊</div>
                        <button className="btn-primary" onClick={handleStart} style={{ padding: '12px 32px' }}>
                            Start Camera
                        </button>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            Stand at arm's length from camera
                        </p>
                    </div>
                )}

                {/* HUD overlay */}
                {started && (
                    <div style={{
                        position: 'absolute', bottom: '12px', left: '12px', right: '12px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    }}>
                        <div style={{
                            padding: '8px 16px', borderRadius: '12px',
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                            color: '#fff', fontSize: '0.82rem', fontWeight: 600,
                        }}>
                            {feedback}
                        </div>
                        {lastPunch && (
                            <div style={{
                                padding: '8px 16px', borderRadius: '12px',
                                background: 'rgba(13,148,136,0.8)', backdropFilter: 'blur(8px)',
                                color: '#fff', fontSize: '1.2rem', fontWeight: 800,
                            }}>
                                {lastPunch.value} m/s
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════ MODE 2: KICK HEIGHT ═══════
function KickHeightMode({ onResult }) {
    const pose = usePoseDetection();
    const videoRef = useRef(null);
    const [started, setStarted] = useState(false);
    const [lastKick, setLastKick] = useState(null);
    const [feedback, setFeedback] = useState('Stand in full view, then throw a kick!');

    // Kick tracking
    const baselineRef = useRef(null); // standing baseline hip-ankle distance
    const kickStateRef = useRef('idle');
    const maxHeightRef = useRef(0);
    const kickStartRef = useRef(0);

    const handleStart = async () => {
        await pose.initializePose();
        if (videoRef.current) {
            await pose.startCamera(videoRef.current, null);
            setStarted(true);
            setFeedback('Calibrating... stand still for 2 seconds');
            // Auto-calibrate baseline after 2 seconds
            setTimeout(() => {
                baselineRef.current = 'pending';
                setFeedback('Ready! Throw a kick!');
            }, 2000);
        }
    };

    useEffect(() => {
        if (!pose.landmarks || !started) return;
        const lm = extractLandmarks(pose.landmarks);
        if (!lm) return;

        // Calculate body height reference (shoulder → ankle)
        const bodyHeight = Math.abs(
            ((lm.leftShoulder.y + lm.rightShoulder.y) / 2) -
            ((lm.leftAnkle.y + lm.rightAnkle.y) / 2)
        );

        // Calibrate baseline
        if (baselineRef.current === 'pending') {
            baselineRef.current = {
                bodyHeight,
                leftAnkleY: lm.leftAnkle.y,
                rightAnkleY: lm.rightAnkle.y,
                hipY: (lm.leftHip.y + lm.rightHip.y) / 2,
            };
            return;
        }

        if (!baselineRef.current || typeof baselineRef.current === 'string') return;

        // Track ankle Y displacement from baseline (positive = foot raised because Y is inverted)
        const leftLift = (baselineRef.current.leftAnkleY - lm.leftAnkle.y) / baselineRef.current.bodyHeight * 100;
        const rightLift = (baselineRef.current.rightAnkleY - lm.rightAnkle.y) / baselineRef.current.bodyHeight * 100;

        const maxLift = Math.max(leftLift, rightLift);
        const kickingLeg = leftLift > rightLift ? 'Left' : 'Right';

        const KICK_START_THRESHOLD = 15; // % of body height
        const KICK_END_THRESHOLD = 8;

        if (kickStateRef.current === 'idle' && maxLift > KICK_START_THRESHOLD) {
            kickStateRef.current = 'kicking';
            kickStartRef.current = performance.now();
            maxHeightRef.current = maxLift;
            setFeedback(`${kickingLeg} kick detected...`);
        } else if (kickStateRef.current === 'kicking') {
            maxHeightRef.current = Math.max(maxHeightRef.current, maxLift);

            if (maxLift < KICK_END_THRESHOLD) {
                // Kick ended
                const height = Math.round(maxHeightRef.current);
                const duration = Math.round(performance.now() - kickStartRef.current);

                if (height > 10 && duration < 2000) {
                    const rating = height > 80 ? '🔥 Head height!' :
                        height > 50 ? '💪 Torso height' :
                            height > 30 ? '👍 Waist height' : '🦵 Low kick';

                    const result = {
                        type: 'kick',
                        value: height,
                        label: `${kickingLeg} ${rating}`,
                    };
                    onResult(result);
                    setLastKick(result);
                    setFeedback(`${kickingLeg} kick: ${height}% body height — ${rating}`);
                }

                kickStateRef.current = 'idle';
                maxHeightRef.current = 0;
            }
        }
    }, [pose.landmarks, started]);

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'relative', width: '100%', aspectRatio: '4/3',
                background: '#111', overflow: 'hidden',
            }}>
                <video ref={videoRef} playsInline muted style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transform: 'scaleX(-1)', display: started ? 'block' : 'none',
                }} />

                {started && pose.landmarks && (
                    <PoseOverlay landmarks={pose.landmarks} formQuality="good" width={640} height={480} />
                )}

                {!started && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '16px',
                    }}>
                        <div style={{ fontSize: '3rem' }}>🦵</div>
                        <button className="btn-primary" onClick={handleStart} style={{ padding: '12px 32px' }}>
                            Start Camera
                        </button>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            Stand full-body in frame (head to feet visible)
                        </p>
                    </div>
                )}

                {/* HUD overlay */}
                {started && (
                    <div style={{
                        position: 'absolute', bottom: '12px', left: '12px', right: '12px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    }}>
                        <div style={{
                            padding: '8px 16px', borderRadius: '12px',
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                            color: '#fff', fontSize: '0.82rem', fontWeight: 600,
                        }}>
                            {feedback}
                        </div>
                        {lastKick && (
                            <div style={{
                                padding: '8px 16px', borderRadius: '12px',
                                background: 'rgba(13,148,136,0.8)', backdropFilter: 'blur(8px)',
                                color: '#fff', fontSize: '1.2rem', fontWeight: 800,
                            }}>
                                {lastKick.value}% height
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════ MODE 3: REACTION CHALLENGE ═══════
const PROMPTS = [
    { text: 'LEFT JAB', side: 'left', color: '#0d9488', emoji: '👈🥊' },
    { text: 'RIGHT HOOK', side: 'right', color: '#14b8a6', emoji: '🥊👉' },
    { text: 'LEFT UPPERCUT', side: 'left', color: '#059669', emoji: '👈💥' },
    { text: 'RIGHT CROSS', side: 'right', color: '#0f766e', emoji: '💥👉' },
    { text: 'BLOCK!', side: 'any', color: '#d97706', emoji: '🛡️' },
    { text: 'LEFT KICK', side: 'left', color: '#dc2626', emoji: '🦵👈' },
    { text: 'RIGHT KICK', side: 'right', color: '#dc2626', emoji: '🦵👉' },
];

function ReactionChallengeMode({ onResult }) {
    const pose = usePoseDetection();
    const videoRef = useRef(null);
    const [started, setStarted] = useState(false);
    const [phase, setPhase] = useState('idle'); // idle, waiting, prompt, result
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [reactionTime, setReactionTime] = useState(null);
    const [round, setRound] = useState(0);

    // Detection refs
    const promptTimeRef = useRef(0);
    const prevWristRef = useRef({ left: null, right: null });
    const detectedRef = useRef(false);
    const waitTimerRef = useRef(null);

    const handleStart = async () => {
        await pose.initializePose();
        if (videoRef.current) {
            await pose.startCamera(videoRef.current, null);
            setStarted(true);
            startRound();
        }
    };

    const startRound = useCallback(() => {
        setPhase('waiting');
        setCurrentPrompt(null);
        setReactionTime(null);
        detectedRef.current = false;

        const delay = 1500 + Math.random() * 3000;
        waitTimerRef.current = setTimeout(() => {
            const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
            setCurrentPrompt(prompt);
            setPhase('prompt');
            promptTimeRef.current = performance.now();
            setRound(prev => prev + 1);

            // Auto-expire after 3 seconds
            setTimeout(() => {
                if (!detectedRef.current) {
                    setPhase('result');
                    setReactionTime(3000);
                    onResult({ type: 'reaction', value: 3000, label: 'Timeout ⏰' });
                }
            }, 3000);
        }, delay);
    }, [onResult]);

    // Detect movement when prompt is shown
    useEffect(() => {
        if (phase !== 'prompt' || !pose.landmarks || detectedRef.current) return;
        const lm = extractLandmarks(pose.landmarks);
        if (!lm) return;

        const VELOCITY_THRESHOLD = 0.04; // normalized units per frame

        if (prevWristRef.current.left && prevWristRef.current.right) {
            const leftVel = calculateDistance(lm.leftWrist, prevWristRef.current.left);
            const rightVel = calculateDistance(lm.rightWrist, prevWristRef.current.right);
            // Also check ankles for kick prompts
            const leftAnkleVel = lm.leftAnkle && prevWristRef.current.leftAnkle
                ? calculateDistance(lm.leftAnkle, prevWristRef.current.leftAnkle)
                : 0;
            const rightAnkleVel = lm.rightAnkle && prevWristRef.current.rightAnkle
                ? calculateDistance(lm.rightAnkle, prevWristRef.current.rightAnkle)
                : 0;

            const maxVel = Math.max(leftVel, rightVel, leftAnkleVel, rightAnkleVel);

            if (maxVel > VELOCITY_THRESHOLD) {
                detectedRef.current = true;
                const time = Math.round(performance.now() - promptTimeRef.current);
                setReactionTime(time);
                setPhase('result');
                onResult({
                    type: 'reaction',
                    value: time,
                    label: `${currentPrompt?.text} ${time}ms`,
                });
            }
        }

        prevWristRef.current = {
            left: { ...lm.leftWrist },
            right: { ...lm.rightWrist },
            leftAnkle: { ...lm.leftAnkle },
            rightAnkle: { ...lm.rightAnkle },
        };
    }, [pose.landmarks, phase, currentPrompt]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
        };
    }, []);

    const promptBg = currentPrompt ? currentPrompt.color : '#111';

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'relative', width: '100%', aspectRatio: '4/3',
                background: '#111', overflow: 'hidden',
            }}>
                <video ref={videoRef} playsInline muted style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transform: 'scaleX(-1)', display: started ? 'block' : 'none',
                }} />

                {started && pose.landmarks && (
                    <PoseOverlay landmarks={pose.landmarks} formQuality="good" width={640} height={480} />
                )}

                {!started && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '16px',
                    }}>
                        <div style={{ fontSize: '3rem' }}>🎯</div>
                        <button className="btn-primary" onClick={handleStart} style={{ padding: '12px 32px' }}>
                            Start Challenge
                        </button>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', maxWidth: '300px' }}>
                            React to on-screen prompts by performing the move. Camera detects your movement.
                        </p>
                    </div>
                )}

                {/* Prompt Overlay */}
                {started && phase === 'waiting' && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                    }}>
                        <div style={{
                            padding: '16px 32px', borderRadius: '16px',
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                            color: '#fff', fontSize: '1.3rem', fontWeight: 700,
                        }}>
                            Get ready...
                        </div>
                    </div>
                )}

                {started && phase === 'prompt' && currentPrompt && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: `${promptBg}44`, pointerEvents: 'none',
                        }}
                    >
                        <div style={{
                            padding: '24px 48px', borderRadius: '20px',
                            background: promptBg, backdropFilter: 'blur(12px)',
                            textAlign: 'center', boxShadow: `0 0 60px ${promptBg}88`,
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{currentPrompt.emoji}</div>
                            <div style={{
                                fontSize: '1.8rem', fontWeight: 900, color: '#fff',
                                letterSpacing: '0.05em', textTransform: 'uppercase',
                            }}>
                                {currentPrompt.text}
                            </div>
                        </div>
                    </motion.div>
                )}

                {started && phase === 'result' && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)', cursor: 'pointer',
                    }} onClick={startRound}>
                        <div style={{
                            padding: '24px 48px', borderRadius: '20px',
                            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
                            textAlign: 'center',
                        }}>
                            <div style={{
                                fontSize: '3rem', fontWeight: 900,
                                color: reactionTime >= 3000 ? 'var(--danger-red)' :
                                    reactionTime < 300 ? 'var(--neon-green)' : '#fff',
                            }}>
                                {reactionTime >= 3000 ? 'Too Slow!' : `${reactionTime}ms`}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
                                {reactionTime < 200 ? '⚡ Incredible reflexes!' :
                                    reactionTime < 300 ? '🔥 Fast!' :
                                        reactionTime < 500 ? '👍 Good' :
                                            reactionTime >= 3000 ? 'Try again!' : '🏃 Keep practicing'}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '12px' }}>
                                Click to go again · Round {round}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════ SHARED MINI METRIC ═══════
function MiniMetric({ label, value, color }) {
    return (
        <div className="glass-card" style={{
            padding: '10px', textAlign: 'center',
            background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
        }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
        </div>
    );
}
