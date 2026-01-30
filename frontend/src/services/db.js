import Dexie from 'dexie';

export const db = new Dexie('FarmManagementDB');

// Define database schema
db.version(1).stores({
    activities: 'id, farm_id, activity_type, activity_date, status',
    crops: 'id, farm_id, crop_type, status',
    fields: 'id, farm_id, name',
    infrastructure: 'id, farm_id, name, type',
    sync_outbox: '++id, method, url, data, timestamp, status' // status: 'pending', 'failed'
});

export const saveToLocal = async (table, data) => {
    if (Array.isArray(data)) {
        return await db[table].bulkPut(data);
    }
    return await db[table].put(data);
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
