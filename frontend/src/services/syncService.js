import api from './api';
import { db, saveToLocal } from './db';

const syncService = {
    isSyncing: false,

    async syncOutbox() {
        if (this.isSyncing) return;
        if (!navigator.onLine) return;

        const pendingChanges = await db.sync_outbox.where({ status: 'pending' }).toArray();
        if (pendingChanges.length === 0) return;

        this.isSyncing = true;

        for (const change of pendingChanges) {
            try {
                await api({
                    method: change.method,
                    url: change.url,
                    data: change.data,
                    skipQueue: true
                });
                await db.sync_outbox.delete(change.id);
            } catch (error) {
                console.error(`[Sync] Failed to sync item ${change.id}:`, error);
                // If it's a permanent error (e.g. 400), we might want to mark it as failed instead of retrying
                if (error.response?.status >= 400 && error.response?.status < 500) {
                    await db.sync_outbox.update(change.id, { status: 'failed' });
                }
                break; // Stop syncing on network error
            }
        }

        this.isSyncing = false;
    },

    async pullFromNetwork(farmId) {
        if (!navigator.onLine || !farmId) return;

        try {

            // Parallel fetch for speed
            const [activities, crops, fields, infrastructure] = await Promise.all([
                api.get(`/farms/${farmId}/activities`),
                api.get(`/farms/${farmId}/crops`),
                api.get(`/farms/${farmId}/fields`),
                api.get(`/infrastructure/farm/${farmId}`)
            ]);

            // Persist to local DB
            await Promise.all([
                saveToLocal('activities', activities.data),
                saveToLocal('crops', crops.data),
                saveToLocal('fields', fields.data),
                saveToLocal('infrastructure', infrastructure.data)
            ]);

            return true;
        } catch (error) {
            console.error('[Sync] Pull failed:', error);
            return false;
        }
    }
};

// Auto-sync when coming back online
window.addEventListener('online', () => {
    syncService.syncOutbox();
});

export default syncService;
