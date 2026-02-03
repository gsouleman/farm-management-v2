import Dexie from 'dexie';

export const db = new Dexie('FarmManagementDB');

// Define database schema
// Define database schema
db.version(3).stores({
    farms: 'id, name',
    activities: 'id, farm_id, activity_type, activity_date, status',
    crops: 'id, farm_id, crop_type, status',
    fields: 'id, farm_id, name',
    infrastructure: 'id, farm_id, name, type',
    cost_settings: 'id, farm_id, category, name', // New table
    sync_outbox: '++id, method, url, data, timestamp, status' // status: 'pending', 'failed'
});

export const saveToLocal = async (table, data) => {
    // 1. Robust Data Extraction (Handle Axios response or wrapped {data: ...})
    let actualData = data;
    if (data && data.data && !Array.isArray(data)) {
        actualData = data.data;
    }

    // 2. Handle Arrays (Bulk Save)
    if (Array.isArray(actualData)) {
        // Filter out items without an ID to prevent "DataError: key path did not yield a value"
        const validItems = actualData.filter(item => item && (item.id || item._id));
        if (validItems.length > 0) {
            return await db[table].bulkPut(validItems);
        }
        return;
    }

    // 3. Handle Single Object
    if (actualData && (actualData.id || actualData._id)) {
        return await db[table].put(actualData);
    }

    if (actualData) {
        console.warn(`[DB] Save to ${table} skipped: Object missing primary key (id)`, actualData);
    }
};

export const getFromLocal = async (table, criteria = {}) => {
    const collection = db[table];
    if (Object.keys(criteria).length === 0) {
        return await collection.toArray();
    }
    return await collection.where(criteria).toArray();
};

export const queueForSync = async (method, url, data) => {
    return await db.sync_outbox.add({
        method,
        url,
        data,
        timestamp: new Date().toISOString(),
        status: 'pending'
    });
};
