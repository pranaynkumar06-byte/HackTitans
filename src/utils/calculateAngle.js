/**
 * calculateAngle.js
 * Computes the angle (in degrees) at point B in triangle A-B-C
 * using vector math (dot product / cross product).
 *
 * Each point is an object: { x, y }
 */

/**
 * Calculate the angle at vertex B formed by points A, B, C.
 * @param {Object} a - First point {x, y}
 * @param {Object} b - Vertex point {x, y}
 * @param {Object} c - Third point {x, y}
 * @returns {number} Angle in degrees (0-180)
 */
export function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * (180 / Math.PI));
    if (angle > 180) angle = 360 - angle;
    return angle;
}

/**
 * Calculate the distance between two points.
 * @param {Object} a - {x, y}
 * @param {Object} b - {x, y}
 * @returns {number} Euclidean distance
 */
export function calculateDistance(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Get angle quality rating based on target range.
 * @param {number} angle - Current angle
 * @param {number} minTarget - Min acceptable angle
 * @param {number} maxTarget - Max acceptable angle
 * @returns {'good' | 'warning' | 'bad'}
 */
export function getAngleQuality(angle, minTarget, maxTarget) {
    if (angle >= minTarget && angle <= maxTarget) return 'good';
    const tolerance = 15;
    if (angle >= minTarget - tolerance && angle <= maxTarget + tolerance) return 'warning';
    return 'bad';
}

/**
 * Extract key landmark positions from MediaPipe pose results.
 * @param {Array} landmarks - Array of 33 landmarks from MediaPipe
 * @returns {Object} Named landmark positions
 */
export function extractLandmarks(landmarks) {
    if (!landmarks || landmarks.length < 33) return null;

    return {
        nose: landmarks[0],
        leftShoulder: landmarks[11],
        rightShoulder: landmarks[12],
        leftElbow: landmarks[13],
        rightElbow: landmarks[14],
        leftWrist: landmarks[15],
        rightWrist: landmarks[16],
        leftHip: landmarks[23],
        rightHip: landmarks[24],
        leftKnee: landmarks[25],
        rightKnee: landmarks[26],
        leftAnkle: landmarks[27],
        rightAnkle: landmarks[28],
        leftHeel: landmarks[29],
        rightHeel: landmarks[30],
        leftFootIndex: landmarks[31],
        rightFootIndex: landmarks[32],
    };
}

/**
 * Calculate midpoint between two landmarks.
 */
export function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
