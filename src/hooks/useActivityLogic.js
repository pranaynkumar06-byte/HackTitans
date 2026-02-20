/**
 * useActivityLogic.js
 * Custom React hook that implements activity-specific detection logic.
 * Handles rep counting, form scoring, and phase detection for each exercise.
 */
import { useState, useRef, useCallback } from 'react';
import { calculateAngle, extractLandmarks, calculateDistance } from '../utils/calculateAngle';

// Activity configuration
const ACTIVITIES = {
    'wall-sit': {
        name: 'Wall Sit',
        type: 'timed',
        metrics: ['holdDuration', 'stabilityScore', 'postureAccuracy'],
    },
    'sit-ups': {
        name: 'Sit Ups',
        type: 'reps',
        metrics: ['repCount', 'formScore'],
    },
    'squats': {
        name: 'Squats',
        type: 'reps',
        metrics: ['repCount', 'depthPercent', 'formScore'],
    },
    'broad-jump': {
        name: 'Standing Broad Jump',
        type: 'distance',
        metrics: ['jumpDistance', 'formScore'],
    },
};

export { ACTIVITIES };

export default function useActivityLogic() {
    const [activity, setActivity] = useState('squats');
    const [metrics, setMetrics] = useState({
        repCount: 0,
        formScore: 0,
        holdDuration: 0,
        stabilityScore: 0,
        postureAccuracy: 0,
        depthPercent: 0,
        jumpDistance: 0,
        jointAngles: {},
        phase: 'idle', // idle, active, rest
        formQuality: 'good', // good, warning, bad
    });

    const [formScores, setFormScores] = useState([]); // Array of per-rep scores
    const [isActive, setIsActive] = useState(false);

    // Phase tracking refs
    const phaseRef = useRef('idle');
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const lastRepTimeRef = useRef(0);
    const stableFramesRef = useRef(0);
    const totalFramesRef = useRef(0);
    const jumpStartRef = useRef(null);
    const prevHipYRef = useRef(null);

    /**
     * Reset all metrics for a new session.
     */
    const resetMetrics = useCallback(() => {
        setMetrics({
            repCount: 0,
            formScore: 0,
            holdDuration: 0,
            stabilityScore: 0,
            postureAccuracy: 0,
            depthPercent: 0,
            jumpDistance: 0,
            jointAngles: {},
            phase: 'idle',
            formQuality: 'good',
        });
        setFormScores([]);
        phaseRef.current = 'idle';
        startTimeRef.current = null;
        stableFramesRef.current = 0;
        totalFramesRef.current = 0;
        jumpStartRef.current = null;
        prevHipYRef.current = null;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    /**
     * Process landmarks for the current activity.
     * Called every frame when pose is detected.
     */
    const processFrame = useCallback((rawLandmarks) => {
        if (!rawLandmarks || !isActive) return;

        const lm = extractLandmarks(rawLandmarks);
        if (!lm) return;

        totalFramesRef.current++;

        switch (activity) {
            case 'wall-sit':
                processWallSit(lm);
                break;
            case 'sit-ups':
                processSitUps(lm);
                break;
            case 'squats':
                processSquats(lm);
                break;
            case 'broad-jump':
                processBroadJump(lm);
                break;
        }
    }, [activity, isActive]);

    // ===== WALL SIT LOGIC =====
    const processWallSit = useCallback((lm) => {
        // Calculate knee angle (hip-knee-ankle)
        const leftKneeAngle = calculateAngle(lm.leftHip, lm.leftKnee, lm.leftAnkle);
        const rightKneeAngle = calculateAngle(lm.rightHip, lm.rightKnee, lm.rightAnkle);
        const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

        // Wall sit valid when knee angle is 85-100 degrees
        const isValidPosture = avgKneeAngle >= 85 && avgKneeAngle <= 100;
        const isWarning = avgKneeAngle >= 75 && avgKneeAngle <= 110;

        if (isValidPosture) {
            stableFramesRef.current++;

            // Start or continue timer
            if (!startTimeRef.current) {
                startTimeRef.current = Date.now();
            }
        }

        const holdDuration = startTimeRef.current
            ? Math.floor((Date.now() - startTimeRef.current) / 1000)
            : 0;

        const stabilityScore = totalFramesRef.current > 0
            ? Math.round((stableFramesRef.current / totalFramesRef.current) * 100)
            : 0;

        const postureAccuracy = isValidPosture ? 100 : isWarning ? 70 : 30;

        setMetrics(prev => ({
            ...prev,
            holdDuration,
            stabilityScore,
            postureAccuracy,
            jointAngles: {
                leftKnee: Math.round(leftKneeAngle),
                rightKnee: Math.round(rightKneeAngle),
            },
            phase: isValidPosture ? 'active' : 'rest',
            formQuality: isValidPosture ? 'good' : isWarning ? 'warning' : 'bad',
            formScore: stabilityScore,
        }));
    }, []);

    // ===== SIT UPS LOGIC =====
    const processSitUps = useCallback((lm) => {
        // Track torso angle (shoulder relative to hip)
        const leftTorsoAngle = calculateAngle(lm.leftKnee, lm.leftHip, lm.leftShoulder);
        const rightTorsoAngle = calculateAngle(lm.rightKnee, lm.rightHip, lm.rightShoulder);
        const avgTorsoAngle = (leftTorsoAngle + rightTorsoAngle) / 2;

        // Phases: lying (angle > 150), upright (angle < 80)
        const isLying = avgTorsoAngle > 140;
        const isUpright = avgTorsoAngle < 90;

        let newPhase = phaseRef.current;
        let repCounted = false;

        if (phaseRef.current === 'idle' && isLying) {
            newPhase = 'down';
        } else if (phaseRef.current === 'down' && isUpright) {
            newPhase = 'up';
        } else if (phaseRef.current === 'up' && isLying) {
            // Complete rep: down → up → down
            newPhase = 'down';
            repCounted = true;

            // Calculate form score for this rep
            const repForm = Math.min(100, Math.round(
                (avgTorsoAngle < 70 ? 100 : 80) * 0.5 +
                (Math.abs(leftTorsoAngle - rightTorsoAngle) < 15 ? 100 : 60) * 0.5
            ));
            setFormScores(prev => [...prev, repForm]);
        }

        phaseRef.current = newPhase;

        setMetrics(prev => ({
            ...prev,
            repCount: repCounted ? prev.repCount + 1 : prev.repCount,
            jointAngles: {
                torso: Math.round(avgTorsoAngle),
            },
            phase: isUpright ? 'active' : 'rest',
            formQuality: isUpright ? 'good' : isLying ? 'good' : 'warning',
            formScore: repCounted
                ? Math.round([...formScores, 85].reduce((a, b) => a + b, 0) / (formScores.length + 1))
                : prev.formScore,
        }));
    }, [formScores]);

    // ===== SQUATS LOGIC =====
    const processSquats = useCallback((lm) => {
        // Calculate hip-knee-ankle angle
        const leftKneeAngle = calculateAngle(lm.leftHip, lm.leftKnee, lm.leftAnkle);
        const rightKneeAngle = calculateAngle(lm.rightHip, lm.rightKnee, lm.rightAnkle);
        const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

        // Down: angle < 95, Up: angle > 165
        const isDown = avgKneeAngle < 95;
        const isUp = avgKneeAngle > 165;
        const isHalfSquat = avgKneeAngle >= 95 && avgKneeAngle <= 120;

        // Depth percentage (180 = standing, 70 = deep squat)
        const depthPercent = Math.round(Math.max(0, Math.min(100,
            ((180 - avgKneeAngle) / (180 - 70)) * 100
        )));

        let newPhase = phaseRef.current;
        let repCounted = false;

        if (phaseRef.current === 'idle' && isUp) {
            newPhase = 'up';
        } else if (phaseRef.current === 'up' && isDown) {
            newPhase = 'down';
        } else if (phaseRef.current === 'down' && isUp) {
            // Full squat completed
            newPhase = 'up';
            repCounted = true;

            const symmetry = Math.abs(leftKneeAngle - rightKneeAngle);
            const repForm = Math.min(100, Math.round(
                (depthPercent > 60 ? 100 : depthPercent * 1.5) * 0.6 +
                (symmetry < 10 ? 100 : Math.max(0, 100 - symmetry * 3)) * 0.4
            ));
            setFormScores(prev => [...prev, repForm]);
        }

        // Reject half squats — don't count but still track
        if (phaseRef.current === 'up' && isHalfSquat) {
            // Just update visual, don't count
        }

        phaseRef.current = newPhase;

        setMetrics(prev => ({
            ...prev,
            repCount: repCounted ? prev.repCount + 1 : prev.repCount,
            depthPercent,
            jointAngles: {
                leftKnee: Math.round(leftKneeAngle),
                rightKnee: Math.round(rightKneeAngle),
            },
            phase: isDown ? 'active' : 'rest',
            formQuality: isDown ? 'good' : isHalfSquat ? 'warning' : 'good',
            formScore: repCounted
                ? Math.round([...formScores, 85].reduce((a, b) => a + b, 0) / (formScores.length + 1))
                : prev.formScore,
        }));
    }, [formScores]);

    // ===== BROAD JUMP LOGIC =====
    const processBroadJump = useCallback((lm) => {
        const hipMid = {
            x: (lm.leftHip.x + lm.rightHip.x) / 2,
            y: (lm.leftHip.y + lm.rightHip.y) / 2,
        };

        const ankleMid = {
            x: (lm.leftAnkle.x + lm.rightAnkle.x) / 2,
            y: (lm.leftAnkle.y + lm.rightAnkle.y) / 2,
        };

        // Detect takeoff (hip Y decreasing rapidly = jumping up)
        if (prevHipYRef.current !== null) {
            const hipDelta = prevHipYRef.current - hipMid.y; // Positive = moving up

            if (hipDelta > 0.03 && !jumpStartRef.current) {
                // Takeoff detected
                jumpStartRef.current = { hip: { ...hipMid }, ankle: { ...ankleMid } };
            }

            if (jumpStartRef.current && hipDelta < -0.01) {
                // Landing detected
                const horizontalDisplacement = Math.abs(hipMid.x - jumpStartRef.current.hip.x);

                // Estimate distance in cm (rough: 1 normalized unit ≈ 300cm for typical camera setup)
                const estimatedDistance = Math.round(horizontalDisplacement * 300);

                // Check for fake forward lean (hip-ankle alignment)
                const torsoLean = Math.abs(hipMid.x - ankleMid.x);
                const isValidJump = torsoLean < 0.15; // Not excessively leaned forward

                if (isValidJump && estimatedDistance > 10) {
                    const formScore = Math.min(100, Math.round(
                        (estimatedDistance > 100 ? 100 : estimatedDistance) * 0.7 +
                        (isValidJump ? 100 : 40) * 0.3
                    ));

                    setMetrics(prev => ({
                        ...prev,
                        jumpDistance: Math.max(prev.jumpDistance, estimatedDistance),
                        repCount: prev.repCount + 1,
                        formScore,
                        formQuality: isValidJump ? 'good' : 'bad',
                        phase: 'active',
                    }));

                    setFormScores(prev => [...prev, formScore]);
                } else if (!isValidJump) {
                    setMetrics(prev => ({
                        ...prev,
                        formQuality: 'bad',
                        phase: 'rest',
                    }));
                }

                jumpStartRef.current = null;
            }
        }

        prevHipYRef.current = hipMid.y;

        // Update joint angles display
        const kneeAngle = calculateAngle(lm.leftHip, lm.leftKnee, lm.leftAnkle);
        setMetrics(prev => ({
            ...prev,
            jointAngles: {
                ...prev.jointAngles,
                knee: Math.round(kneeAngle),
            },
        }));
    }, []);

    /**
     * Start a new assessment session.
     */
    const startSession = useCallback(() => {
        resetMetrics();
        setIsActive(true);
        phaseRef.current = 'idle';
    }, [resetMetrics]);

    /**
     * Stop the current session.
     */
    const stopSession = useCallback(() => {
        setIsActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    /**
     * Get the current activity configuration.
     */
    const getActivityConfig = useCallback(() => {
        return ACTIVITIES[activity] || ACTIVITIES['squats'];
    }, [activity]);

    return {
        activity,
        setActivity,
        metrics,
        formScores,
        isActive,
        processFrame,
        startSession,
        stopSession,
        resetMetrics,
        getActivityConfig,
        ACTIVITIES,
    };
}
