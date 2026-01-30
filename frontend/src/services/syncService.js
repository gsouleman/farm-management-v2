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
        console.log(`[Sync] Starting synchronization of ${pendingChanges.length} items...`);

        for (const change of pendingChanges) {
            try {
                await api({
                    method: change.method,
                    url: change.url,
                    data: change.data,
                    skipQueue: true
                });
                await db.sync_outbox.delete(change.id);
                console.log(`[Sync] Successfully synced: ${change.method} ${change.url}`);
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
        console.log('[Sync] Synchronization cycle complete.');
    },

    async pullFromNetwork(farmId) {
        if (!navigator.onLine || !farmId) return;

        try {
            console.log(`[Sync] Hub refreshing data for Farm ID: ${farmId}`);

            // Parallel fetch for speed
            const [activities, crops, fields, infrastructure] = await Promise.all([
                api.get(`/activities?farm_id=${farmId}`),
                api.get(`/crops?farm_id=${farmId}`),
                api.get(`/fields/farm/${farmId}`),
                api.get(`/infrastructure?farm_id=${farmId}`)
            ]);

            // Persist to local DB
            await Promise.all([
                saveToLocal('activities', activities.data),
                saveToLocal('crops', crops.data),
                saveToLocal('fields', fields.data),
                saveToLocal('infrastructure', infrastructure.data)
            ]);

            console.log('[Sync] Local database updated with remote state.');
            return true;
        } catch (error) {
            console.error('[Sync] Pull failed:', error);
            return false;
        }
    }
};

// Auto-sync when coming back online
window.addEventListener('online', () => {
    console.log('[Network] System back online. Triggering sync...');
    syncService.syncOutbox();
});

export default syncService;
