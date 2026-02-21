/**
 * scoringSystem.js
 * Multi-module weighted scoring algorithm.
 * Speed Score = (Sprint + Agility) / 2
 * Strength Score = (Pushups + Jump) / 2
 * Endurance Score = Beep Test Level score
 * Skill Score = Accuracy %
 * Reaction Score = Reaction time score
 * Final = Weighted average → radar chart
 */

// ═══════ WEIGHTS ═══════
const MODULE_WEIGHTS = {
    speed: 0.25,
    strength: 0.25,
    endurance: 0.2,
    skill: 0.15,
    reaction: 0.15,
};

// ═══════ INDIVIDUAL SCORE CALCULATORS ═══════

/**
 * Score a single form-based test (pushups, squats, etc.)
 * @param {number} formAccuracy - 0-100
 * @param {number} endurance - 0-100 (reps or duration normalized)
 * @param {number} consistency - 0-100
 * @param {number} aiConfidence - 0-100
 * @returns {number} 0-100
 */
export function calculateFormScore(formAccuracy, endurance, consistency, aiConfidence) {
    const score = (formAccuracy * 0.4) + (endurance * 0.3) + (consistency * 0.2) + (aiConfidence * 0.1);
    return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Score sprint based on time relative to benchmarks.
 * @param {number} time - Sprint time in seconds
 * @param {number} distance - 20 or 40 meters
 * @returns {number} 0-100
 */
export function calculateSprintScore(time, distance = 20) {
    const benchmarks = distance === 20
        ? { elite: 2.8, poor: 4.5 }
        : { elite: 4.8, poor: 7.5 };
    return Math.round(Math.max(0, Math.min(100, ((benchmarks.poor - time) / (benchmarks.poor - benchmarks.elite)) * 100)));
}

/**
 * Score agility T-Test based on completion time.
 * @param {number} time - T-test time in seconds
 * @returns {number} 0-100
 */
export function calculateAgilityScore(time) {
    const elite = 9.5, poor = 13.0;
    return Math.round(Math.max(0, Math.min(100, ((poor - time) / (poor - elite)) * 100)));
}

/**
 * Score push-up test based on reps, form, and fatigue.
 * @param {number} reps - Total reps in 1 minute
 * @param {number} formAccuracy - 0-100
 * @param {number} fatigueRate - 0-100 (lower is better)
 * @returns {number} 0-100
 */
export function calculatePushUpScore(reps, formAccuracy, fatigueRate) {
    const repScore = Math.min(100, (reps / 50) * 100); // 50 reps = 100 score
    const fatigueBonus = Math.max(0, 100 - fatigueRate);
    return Math.round((repScore * 0.4 + formAccuracy * 0.4 + fatigueBonus * 0.2));
}

/**
 * Score vertical jump based on height.
 * @param {number} heightCm - Jump height in cm
 * @returns {number} 0-100
 */
export function calculateJumpScore(heightCm) {
    return Math.round(Math.max(0, Math.min(100, (heightCm / 70) * 100))); // 70cm = elite
}

/**
 * Score beep test based on level reached.
 * @param {number} level - Beep test level (1-15)
 * @returns {number} 0-100
 */
export function calculateBeepScore(level) {
    return Math.round(Math.min(100, (level / 15) * 100));
}

/**
 * Score target accuracy percentage.
 * @param {number} accuracy - 0-100
 * @param {number} consistency - 0-100
 * @returns {number} 0-100
 */
export function calculateAccuracyScore(accuracy, consistency) {
    return Math.round(accuracy * 0.7 + consistency * 0.3);
}

/**
 * Score reaction time (lower is better).
 * @param {number} avgMs - Average reaction time in milliseconds
 * @returns {number} 0-100
 */
export function calculateReactionScore(avgMs) {
    if (avgMs <= 0) return 0;
    // 150ms = 100, 500ms = 0
    return Math.round(Math.max(0, Math.min(100, ((500 - avgMs) / 350) * 100)));
}

/**
 * Score combat reaction (punch speed + kick height + reaction time).
 * @param {number} avgReactionMs - Average reaction time in ms
 * @param {number} punchSpeedMs - Average punch speed in m/s
 * @param {number} kickHeightPercent - Average kick height as % of body
 * @returns {number} 0-100
 */
export function calculateCombatScore(avgReactionMs, punchSpeedMs = 0, kickHeightPercent = 0) {
    const reactionScore = calculateReactionScore(avgReactionMs);
    // Punch speed: 8 m/s = 100, 2 m/s = 0
    const punchScore = Math.round(Math.max(0, Math.min(100, ((punchSpeedMs - 2) / 6) * 100)));
    // Kick height: 80% = 100, 15% = 0
    const kickScore = Math.round(Math.max(0, Math.min(100, ((kickHeightPercent - 15) / 65) * 100)));
    return Math.round(reactionScore * 0.4 + punchScore * 0.3 + kickScore * 0.3);
}

// ═══════ COMPOSITE SCORING ═══════

/**
 * Calculate overall weighted score from all module scores.
 * @param {Object} moduleScores - { speed, strength, endurance, skill, reaction }
 * @returns {number} 0-100
 */
export function calculateOverallScore(moduleScores) {
    const { speed = 0, strength = 0, endurance = 0, skill = 0, reaction = 0 } = moduleScores;
    const overall =
        speed * MODULE_WEIGHTS.speed +
        strength * MODULE_WEIGHTS.strength +
        endurance * MODULE_WEIGHTS.endurance +
        skill * MODULE_WEIGHTS.skill +
        reaction * MODULE_WEIGHTS.reaction;
    return Math.round(Math.min(100, Math.max(0, overall)));
}

/**
 * Calculate combined speed score from sprint + agility.
 */
export function calculateSpeedModule(sprintScore, agilityScore) {
    return Math.round((sprintScore + agilityScore) / 2);
}

/**
 * Calculate combined strength score from pushups + jump.
 */
export function calculateStrengthModule(pushUpScore, jumpScore) {
    return Math.round((pushUpScore + jumpScore) / 2);
}

// ═══════ XP & LEVELING ═══════

export function calculateXP(reps, formAccuracy) {
    const baseXP = reps * 10;
    const formBonus = formAccuracy >= 90 ? 5 * reps : 0;
    return baseXP + formBonus;
}

export function getLevel(totalXP) {
    return Math.floor(totalXP / 200) + 1;
}

export function getLevelProgress(totalXP) {
    const xpInLevel = totalXP % 200;
    return { current: xpInLevel, needed: 200, percent: Math.round((xpInLevel / 200) * 100) };
}

// ═══════ BADGES ═══════

export const BADGES = [
    { id: 'sprint-demon', name: 'Sprint Demon', icon: '🏃', description: 'Score 90+ on sprint test', condition: (stats) => (stats.sprintScore || 0) >= 90 },
    { id: 'iron-arms', name: 'Iron Arms', icon: '💪', description: '40+ push-ups in 1 minute', condition: (stats) => (stats.pushUpReps || 0) >= 40 },
    { id: 'sky-high', name: 'Sky High', icon: '🦘', description: 'Jump 50cm+ vertical', condition: (stats) => (stats.jumpHeight || 0) >= 50 },
    { id: 'endurance-king', name: 'Endurance King', icon: '🫀', description: 'Reach Level 10 on Beep Test', condition: (stats) => (stats.beepLevel || 0) >= 10 },
    { id: 'sharpshooter', name: 'Sharpshooter', icon: '🎯', description: '80%+ target accuracy', condition: (stats) => (stats.targetAccuracy || 0) >= 80 },
    { id: 'lightning-reflexes', name: 'Lightning Reflexes', icon: '⚡', description: 'Sub-200ms reaction time', condition: (stats) => (stats.reactionAvg || 999) < 200 },
    {
        id: 'all-rounder', name: 'All Rounder', icon: '🏆', description: '70+ in all 5 modules', condition: (stats) => {
            const s = stats.moduleScores || {};
            return s.speed >= 70 && s.strength >= 70 && s.endurance >= 70 && s.skill >= 70 && s.reaction >= 70;
        }
    },
    { id: 'agility-master', name: 'Agility Master', icon: '🔄', description: 'Score 85+ on T-Test', condition: (stats) => (stats.agilityScore || 0) >= 85 },
    { id: 'combat-elite', name: 'Combat Elite', icon: '🥊', description: 'Sub-250ms combat reaction time', condition: (stats) => (stats.combatReactionAvg || 999) < 250 },
];

export function checkBadges(stats) {
    return BADGES.filter(badge => {
        try { return badge.condition(stats); } catch { return false; }
    });
}

// ═══════ RANKING ═══════

export function calculatePercentile(score) {
    if (score >= 95) return 99;
    if (score >= 90) return 95;
    if (score >= 80) return 85;
    if (score >= 70) return 72;
    if (score >= 60) return 55;
    if (score >= 50) return 40;
    if (score >= 40) return 25;
    return 10;
}

export function calculateNationalRank(percentile, totalAthletes = 150000) {
    return Math.round(totalAthletes * (1 - percentile / 100));
}

export default {
    calculateFormScore,
    calculateSprintScore,
    calculateAgilityScore,
    calculatePushUpScore,
    calculateJumpScore,
    calculateBeepScore,
    calculateAccuracyScore,
    calculateReactionScore,
    calculateCombatScore,
    calculateOverallScore,
    calculateSpeedModule,
    calculateStrengthModule,
    calculateXP,
    getLevel,
    getLevelProgress,
    BADGES,
    checkBadges,
    calculatePercentile,
    calculateNationalRank,
    MODULE_WEIGHTS,
};
