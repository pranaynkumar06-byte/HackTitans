/**
 * syncService.js
 * Handles online/offline detection and auto-sync of queued test results.
 */
import { getSyncQueue, clearSyncQueue, markResultsSynced } from './offlineStorage';

const MOCK_API_ENDPOINT = 'https://api.sportsauthority.gov.in/v1/assessments';

/**
 * Check if the browser is currently online.
 * @returns {boolean}
 */
export function isOnline() {
    return navigator.onLine;
}

/**
 * Mock API submission to Sports Authority endpoint.
 * In production, this would POST to a real backend.
 * @param {Array} results - Test results to submit
 * @returns {Object} Mock response
 */
async function submitToAPI(results) {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    return {
        success: true,
        message: `${results.length} result(s) submitted successfully`,
        timestamp: new Date().toISOString(),
        referenceId: `SAI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
}

/**
 * Attempt to sync all queued results.
 * @returns {Object} Sync result { success, message, syncedCount }
 */
export async function syncResults() {
    if (!isOnline()) {
        return {
            success: false,
            message: 'No internet connection. Results will sync automatically when online.',
            syncedCount: 0,
        };
    }

    try {
        const queue = await getSyncQueue();

        if (queue.length === 0) {
            return {
                success: true,
                message: 'All results are already synced.',
                syncedCount: 0,
            };
        }

        // Submit to mock API
        const response = await submitToAPI(queue);

        if (response.success) {
            // Mark as synced and clear queue
            const ids = queue.map(item => item.resultId).filter(Boolean);
            await markResultsSynced(ids);
            await clearSyncQueue();

            return {
                success: true,
                message: `Successfully synced ${queue.length} result(s) to Sports Authority.`,
                syncedCount: queue.length,
                referenceId: response.referenceId,
            };
        }

        return {
            success: false,
            message: 'Sync failed. Will retry automatically.',
            syncedCount: 0,
        };
    } catch (error) {
        return {
            success: false,
            message: `Sync error: ${error.message}`,
            syncedCount: 0,
        };
    }
}

/**
 * Register online/offline event listeners for auto-sync.
 * @param {Function} onStatusChange - Callback for status changes (online/offline)
 * @param {Function} onSyncComplete - Callback when sync completes
 * @returns {Function} Cleanup function to remove listeners
 */
export function registerSyncListeners(onStatusChange, onSyncComplete) {
    const handleOnline = async () => {
        onStatusChange?.(true);
        // Auto-sync when coming back online
        const result = await syncResults();
        onSyncComplete?.(result);
    };

    const handleOffline = () => {
        onStatusChange?.(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}

export default {
    isOnline,
    syncResults,
    registerSyncListeners,
};
