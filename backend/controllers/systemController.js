const SYSTEM_MESSAGES = {
    CONFIRMATIONS: {
        DELETE_HARVEST: {
            title: 'CRITICAL ACTION: CONFIRM DATA REMOVAL',
            body: 'Are you sure you want to permanently delete this harvest entry from the operational archive?\n\nThis action cannot be undone.',
            type: 'warning'
        },
        DELETE_CROP: {
            title: 'PROTOCOL ALERT: ASSET LIQUIDATION',
            body: 'You are about to remove this crop planting from the field registry. This will also archive all associated activities.',
            type: 'warning'
        },
        DELETE_INFRA: {
            title: 'INFRASTRUCTURE DECOMMISSIONING',
            body: 'Are you sure you want to decommission and delete this infrastructure asset?',
            type: 'warning'
        },
        DELETE_ACTIVITY: {
            title: 'JOURNAL AUDIT: RECORD REMOVAL',
            body: 'Confirm removal of this activity from the operational journal. This may affect associated harvest or cost data.',
            type: 'warning'
        },
        DELETE_FIELD: {
            title: 'LAND REGISTRY: PARCEL REMOVAL',
            body: 'Are you sure you want to delete this field? This will remove all mapping data and associated crop history.',
            type: 'warning'
        },
        DELETE_INPUT: {
            title: 'INVENTORY LIQUIDATION',
            body: 'Confirm removal of this item from the stock registry.',
            type: 'warning'
        },
        REVOKE_ACCESS: {
            title: 'SECURITY PROTOCOL: REVOKE ACCESS',
            body: 'Are you sure you want to terminate this collaborator\'s access to the station data?',
            type: 'danger'
        },
        DELETE_FILE: {
            title: 'VAULT ACCESS: PERMANENT PURGE',
            body: 'Confirm the permanent deletion of this file from the farm records. This cannot be undone.',
            type: 'warning'
        }
    },
    ALERTS: {
        INVALID_CROP: {
            title: 'SYSTEM PROTOCOL ALERT: INVALID CROP REFERENCE',
            body: 'The operation was blocked because the selected crop is a template or invalid. You must select an ACTIVE planting from the field list.',
            type: 'error'
        },
        NO_BOUNDARY: {
            title: 'MAPPING PROTOCOL ALERT: BOUNDARY REQUIRED',
            body: 'Operational boundaries must be established on the spatial map before registration can proceed.',
            type: 'error'
        },
        NO_FIELD_SELECTION: {
            title: 'OPERATIONAL ERROR: FIELD NOT SPECIFIED',
            body: 'Please identify the target field for this operation from the land registry.',
            type: 'error'
        },
        NO_FARM_SELECTION: {
            title: 'SYSTEM ACCESS ALERT: STATION NOT SELECTED',
            body: 'No active agricultural station identified. Please select a farm to continue.',
            type: 'error'
        },
        INVALID_QUANTITY: {
            title: 'DATA INTEGRITY ALERT: INVALID METRICS',
            body: 'The entered quantity or value violates operational logic. Please verify your inputs.',
            type: 'error'
        },
        INVITE_FAILURE: {
            title: 'COMMUNICATION ERROR: INVITE FAILED',
            body: 'The invitation protocol was interrupted. Please verify the email address and network connectivity.',
            type: 'error'
        },
        UPLOAD_FAILURE: {
            title: 'STORAGE PROTOCOL ERROR: UPLOAD FAILED',
            body: 'The file transfer was rejected by the server. Please check file size and network stability.',
            type: 'error'
        },
        SAVE_FAILURE: {
            title: 'DATA PERSISTENCE ERROR: SAVE FAILED',
            body: 'The system encountered an error while attempting to archive this record. Please verify all required fields.',
            type: 'error'
        }
    },
    SUCCESS: {
        SAVE: 'RECORD ARCHIVED SUCCESSFULLY - DATA SECURED',
        UPDATE: 'STRATEGIC UPDATE COMPLETE - SYSTEM SYNCED',
        DELETE: 'RECORD PERMANENTLY REMOVED FROM ARCHIVE'
    },
    ERROR: {
        GENERIC: 'OPERATIONAL FAILURE: SYSTEM INTEGRITY ALERT',
        UNAUTHORIZED: 'ACCESS DENIED: INSUFFICIENT PERMISSIONS',
        NOT_FOUND: 'RESOURCE NOT LOCATED IN ARCHIVE'
    }
};

exports.getSystemMessages = (req, res) => {
    res.json(SYSTEM_MESSAGES);
};

exports.getConfirmation = (req, res) => {
    const { action } = req.params;
    const confirmation = SYSTEM_MESSAGES.CONFIRMATIONS[action.toUpperCase()];
    if (!confirmation) {
        return res.status(404).json({ message: 'Confirmation template not found' });
    }
    res.json(confirmation);
};
