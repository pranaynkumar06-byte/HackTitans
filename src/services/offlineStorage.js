/**
 * offlineStorage.js
 * IndexedDB wrapper for offline test result storage.
 * Uses the 'idb' library for a cleaner Promise-based API.
 */
import { openDB } from 'idb';

const DB_NAME = 'AthleteAI_DB';
const DB_VERSION = 1;
const STORE_RESULTS = 'testResults';
const STORE_ATHLETE = 'athleteProfile';
const STORE_SYNC_QUEUE = 'syncQueue';

/**
 * Initialize the IndexedDB database.
 */
async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Test results store
            if (!db.objectStoreNames.contains(STORE_RESULTS)) {
                const resultsStore = db.createObjectStore(STORE_RESULTS, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                resultsStore.createIndex('date', 'date');
                resultsStore.createIndex('activity', 'activity');
                resultsStore.createIndex('synced', 'synced');
            }

            // Athlete profile store
            if (!db.objectStoreNames.contains(STORE_ATHLETE)) {
                db.createObjectStore(STORE_ATHLETE, { keyPath: 'id' });
            }

            // Sync queue for offline results
            if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
                db.createObjectStore(STORE_SYNC_QUEUE, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
            }
        },
    });
}

// ===== TEST RESULTS =====

/**
 * Save a test result to IndexedDB.
 * @param {Object} result - Test result data
 * @returns {number} Record ID
 */
export async function saveTestResult(result) {
    const db = await getDB();
    const record = {
        ...result,
        date: new Date().toISOString(),
        synced: navigator.onLine,
    };
    const id = await db.add(STORE_RESULTS, record);

    // If offline, add to sync queue
    if (!navigator.onLine) {
        await db.add(STORE_SYNC_QUEUE, { resultId: id, ...record });
    }

    return id;
}

/**
 * Get all test results, sorted by date (newest first).
 * @returns {Array} Test results
 */
export async function getAllResults() {
    const db = await getDB();
    const results = await db.getAll(STORE_RESULTS);
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get results for a specific activity.
 * @param {string} activity - Activity type
 * @returns {Array} Filtered results
 */
export async function getResultsByActivity(activity) {
    const db = await getDB();
    const results = await db.getAllFromIndex(STORE_RESULTS, 'activity', activity);
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ===== ATHLETE PROFILE =====

/**
 * Save or update athlete profile.
 * @param {Object} profile - Athlete profile data
 */
export async function saveAthleteProfile(profile) {
    const db = await getDB();
    await db.put(STORE_ATHLETE, { id: 'primary', ...profile });
}

/**
 * Get the athlete profile.
 * @returns {Object|null} Athlete profile
 */
export async function getAthleteProfile() {
    const db = await getDB();
    return await db.get(STORE_ATHLETE, 'primary');
}

// ===== SYNC QUEUE =====

/**
 * Get all items in the sync queue.
 * @returns {Array} Unsynced items
 */
export async function getSyncQueue() {
    const db = await getDB();
    return await db.getAll(STORE_SYNC_QUEUE);
}

/**
 * Clear the sync queue after successful sync.
 */
export async function clearSyncQueue() {
    const db = await getDB();
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
    await tx.store.clear();
    await tx.done;
}

/**
 * Mark results as synced.
 * @param {Array<number>} ids - Result IDs to mark as synced
 */
export async function markResultsSynced(ids) {
    const db = await getDB();
    const tx = db.transaction(STORE_RESULTS, 'readwrite');
    for (const id of ids) {
        const result = await tx.store.get(id);
        if (result) {
            result.synced = true;
            await tx.store.put(result);
        }
    }
    await tx.done;
}

export default {
    saveTestResult,
    getAllResults,
    getResultsByActivity,
    saveAthleteProfile,
    getAthleteProfile,
    getSyncQueue,
    clearSyncQueue,
    markResultsSynced,
};
