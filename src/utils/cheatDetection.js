/**
 * cheatDetection.js
 * Enhanced cheat detection:
 * - Multiple people detection
 * - Incorrect camera angles
 * - Video cuts/edits (sudden landmark jumps)
 * - Malpractice: wrong exercise for chosen activity
 * - Brightness checks
 * - Beep alert audio
 */

let audioCtx = null;

/**
 * Play a warning beep sound.
 */
export function playAlertBeep() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 440;
        gain.gain.value = 0.4;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) { /* ignore audio errors */ }
}

/**
 * Check if multiple people are detected in frame.
 * If too many scattered landmarks are visible, flag it.
 */
export function checkSinglePerson(landmarks) {
    if (!landmarks || landmarks.length === 0) return false;
    const keyIndices = [0, 2, 5, 11, 12, 13, 14, 23, 24];
    const visibleCount = keyIndices.filter(i => landmarks[i]?.visibility > 0.3).length;
    return visibleCount >= 3;
}

/**
 * Detect if there are extra people by checking if landmark positions
 * are wildly inconsistent (another person's silhouette confusing MediaPipe).
 */
export function checkNoExtraPeople(landmarks) {
    if (!landmarks || landmarks.length < 25) return true;
    // Check if hip-to-shoulder distance is reasonable (not split person)
    const lShoulder = landmarks[11];
    const rShoulder = landmarks[12];
    const lHip = landmarks[23];
    const rHip = landmarks[24];
    if (!lShoulder || !rShoulder || !lHip || !rHip) return true;

    const shoulderWidth = Math.abs(lShoulder.x - rShoulder.x);
    const hipWidth = Math.abs(lHip.x - rHip.x);

    // If shoulder width is absurdly wide (>0.6 of frame = likely 2 people)
    if (shoulderWidth > 0.6 || hipWidth > 0.6) return false;
    return true;
}

/**
 * Check face is visible.
 */
export function checkFaceVisible(landmarks) {
    if (!landmarks) return false;
    const nose = landmarks[0];
    const leftEye = landmarks[2];
    const rightEye = landmarks[5];
    return (
        nose?.visibility > 0.3 &&
        leftEye?.visibility > 0.3 &&
        rightEye?.visibility > 0.3
    );
}

/**
 * Check camera angle correctness.
 * Ensures person is roughly centered and not too far/close.
 */
export function checkCameraAngle(landmarks) {
    if (!landmarks) return { valid: true, issue: '' };
    const nose = landmarks[0];
    const lHip = landmarks[23];
    const rHip = landmarks[24];

    if (!nose || nose.visibility < 0.3) return { valid: true, issue: '' };

    // Check if person is roughly in the center third
    if (nose.x < 0.1 || nose.x > 0.9) {
        return { valid: false, issue: 'Person too far to the side — center the camera' };
    }

    // Check if person is too close (head fills top)
    if (nose.y < 0.05) {
        return { valid: false, issue: 'Camera too close — step back' };
    }

    // Check if person is too far
    if (lHip && rHip && lHip.visibility > 0.3 && rHip.visibility > 0.3) {
        const bodyHeight = Math.abs(nose.y - ((lHip.y + rHip.y) / 2));
        if (bodyHeight < 0.1) {
            return { valid: false, issue: 'Camera too far — move closer' };
        }
    }

    return { valid: true, issue: '' };
}

/**
 * Detect video cuts/edits by checking for sudden landmark position jumps.
 */
let prevLandmarkPositions = null;

export function checkForVideoCuts(landmarks) {
    if (!landmarks) { prevLandmarkPositions = null; return { cut: false }; }

    const nose = landmarks[0];
    const lShoulder = landmarks[11];
    if (!nose || !lShoulder) { prevLandmarkPositions = null; return { cut: false }; }

    const current = { noseX: nose.x, noseY: nose.y, sX: lShoulder.x, sY: lShoulder.y };

    if (prevLandmarkPositions) {
        const noseDist = Math.sqrt(
            Math.pow(current.noseX - prevLandmarkPositions.noseX, 2) +
            Math.pow(current.noseY - prevLandmarkPositions.noseY, 2)
        );
        const shoulderDist = Math.sqrt(
            Math.pow(current.sX - prevLandmarkPositions.sX, 2) +
            Math.pow(current.sY - prevLandmarkPositions.sY, 2)
        );

        // If nose or shoulder jumped more than 30% of frame in one frame → likely a cut
        if (noseDist > 0.3 || shoulderDist > 0.3) {
            prevLandmarkPositions = current;
            return { cut: true };
        }
    }

    prevLandmarkPositions = current;
    return { cut: false };
}

/**
 * Malpractice detection: check if the user is doing the wrong exercise.
 * @param {string} expectedActivity - The activity they should be performing
 * @param {Array} landmarks - Current pose landmarks
 * @returns {{ malpractice: boolean, reason: string }}
 */
export function checkMalpractice(expectedActivity, landmarks) {
    if (!landmarks || !expectedActivity) return { malpractice: false, reason: '' };

    const nose = landmarks[0];
    const lShoulder = landmarks[11];
    const rShoulder = landmarks[12];
    const lHip = landmarks[23];
    const rHip = landmarks[24];
    const lKnee = landmarks[25];
    const rKnee = landmarks[26];
    const lAnkle = landmarks[27];
    const rAnkle = landmarks[28];
    const lWrist = landmarks[15];
    const rWrist = landmarks[16];

    if (!nose || !lShoulder || !rShoulder) return { malpractice: false, reason: '' };
    if (nose.visibility < 0.3 || lShoulder.visibility < 0.3) return { malpractice: false, reason: '' };

    const torsoAngle = Math.abs(nose.y - ((lHip?.y || 0.5) + (rHip?.y || 0.5)) / 2);

    switch (expectedActivity) {
        case 'push-ups':
        case 'pushups': {
            // Push-ups: person should be roughly horizontal (nose.y ≈ hip.y)
            // If standing upright (nose.y << hip.y), that's wrong
            if (lHip && rHip && lHip.visibility > 0.3 && rHip.visibility > 0.3) {
                const hipY = (lHip.y + rHip.y) / 2;
                // If nose is significantly above hips and body is upright → not push-ups
                if (nose.y < hipY - 0.25 && torsoAngle > 0.3) {
                    return { malpractice: true, reason: 'You appear to be standing — get into push-up position' };
                }
            }
            break;
        }
        case 'squats': {
            // Squats: person should be upright/slightly bent. If horizontal → wrong
            if (lHip && rHip && lHip.visibility > 0.3) {
                const hipY = (lHip.y + rHip.y) / 2;
                // If nose and hips are at same height (horizontal) → likely lying down, not squatting
                if (Math.abs(nose.y - hipY) < 0.05) {
                    return { malpractice: true, reason: 'Incorrect position — stand upright for squats' };
                }
            }
            break;
        }
        case 'wall-sit': {
            // Wall sit: person should be in sitting position (knees bent ~90°)
            // If fully standing (knees straight) → not doing wall sit
            if (lKnee && lHip && lAnkle && lKnee.visibility > 0.3 && lAnkle.visibility > 0.3) {
                const kneeAngle = Math.abs(lKnee.y - lHip.y);
                if (kneeAngle < 0.02) {
                    return { malpractice: true, reason: 'Sit down against the wall — knees should be bent' };
                }
            }
            break;
        }
        case 'vertical-jump':
        case 'broad-jump': {
            // Jump tests: user should be standing initially
            if (lAnkle && rAnkle && lAnkle.visibility > 0.3) {
                const ankleY = (lAnkle.y + rAnkle.y) / 2;
                // If ankles are at same height as shoulders → lying down
                if (Math.abs(ankleY - nose.y) < 0.1) {
                    return { malpractice: true, reason: 'Stand upright for jump test' };
                }
            }
            break;
        }
        default:
            break;
    }

    return { malpractice: false, reason: '' };
}

/**
 * Check brightness.
 */
export function checkBrightness(ctx, width, height) {
    try {
        const sampleSize = 50;
        const imageData = ctx.getImageData(
            Math.floor(width / 4), Math.floor(height / 4), sampleSize, sampleSize
        );
        const data = imageData.data;
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
            totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        return (totalBrightness / (sampleSize * sampleSize)) > 30;
    } catch {
        return true;
    }
}

export function checkNoSuddenLightingChange(current, prev) {
    if (prev === null) return true;
    return Math.abs(current - prev) < 50;
}

/**
 * Enhanced cheat detection.
 * Returns alerts array with severity levels.
 */
export function runCheatDetection(landmarks, ctx, width, height, prevBrightness, expectedActivity) {
    const results = {
        isValid: true,
        warnings: [],
        alerts: [],        // critical alerts (red overlay + beep)
        currentBrightness: null,
        shouldShowRedOverlay: false,
    };

    // 1. Extra people check
    if (!checkNoExtraPeople(landmarks)) {
        results.alerts.push('⚠ Multiple people detected — only one person allowed');
        results.shouldShowRedOverlay = true;
        results.isValid = false;
    }

    // 2. Single person visible
    if (!checkSinglePerson(landmarks)) {
        results.warnings.push('No person detected in frame');
    }

    // 3. Camera angle
    const cameraCheck = checkCameraAngle(landmarks);
    if (!cameraCheck.valid) {
        results.alerts.push(cameraCheck.issue);
        results.shouldShowRedOverlay = true;
    }

    // 4. Video cuts
    const cutCheck = checkForVideoCuts(landmarks);
    if (cutCheck.cut) {
        results.alerts.push('⚠ Suspicious video cut/edit detected');
        results.shouldShowRedOverlay = true;
        results.isValid = false;
    }

    // 5. Malpractice (wrong exercise)
    if (expectedActivity) {
        const malCheck = checkMalpractice(expectedActivity, landmarks);
        if (malCheck.malpractice) {
            results.alerts.push(`🚫 ${malCheck.reason}`);
            results.shouldShowRedOverlay = true;
        }
    }

    // 6. Face visibility
    if (landmarks && !checkFaceVisible(landmarks)) {
        results.warnings.push('Face not clearly visible');
    }

    // 7. Brightness
    if (ctx) {
        if (!checkBrightness(ctx, width, height)) {
            results.isValid = false;
            results.warnings.push('Insufficient lighting detected');
        }
    }

    return results;
}

export default {
    checkSinglePerson,
    checkNoExtraPeople,
    checkFaceVisible,
    checkCameraAngle,
    checkForVideoCuts,
    checkMalpractice,
    checkBrightness,
    checkNoSuddenLightingChange,
    runCheatDetection,
    playAlertBeep,
};
