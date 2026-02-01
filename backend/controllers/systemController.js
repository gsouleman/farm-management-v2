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
