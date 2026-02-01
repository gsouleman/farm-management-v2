import { create } from 'zustand';

const useUIStore = create((set, get) => ({
    notification: null, // { message, type: 'success' | 'error' | 'info', visible: boolean }
    systemMessages: null,
    modal: {
        isOpen: false,
        type: 'alert', // 'alert' | 'confirm'
        title: '',
        body: '',
        onConfirm: null, // Callback for confirm action
        singleAction: false, // if true, only show OK button (for alerts)
    },

    fetchSystemMessages: async () => {
        try {
            const api = (await import('../services/api')).default;
            const response = await api.get('/system/messages');
            set({ systemMessages: response.data });
        } catch (error) {
            console.error('[UIStore] Failed to fetch system messages:', error);
        }
    },

    getConfirmation: (action) => {
        const state = get();
        if (state.systemMessages?.CONFIRMATIONS) {
            return state.systemMessages.CONFIRMATIONS[action.toUpperCase()];
        }
        return null;
    },

    getAlert: (action) => {
        const state = get();
        if (state.systemMessages?.ALERTS) {
            return state.systemMessages.ALERTS[action.toUpperCase()];
        }
        return null;
    },

    openModal: (options) => {
        set({
            modal: {
                isOpen: true,
                type: options.type || 'alert',
                title: options.title || '',
                body: options.body || '',
                onConfirm: options.onConfirm || null,
                singleAction: options.singleAction || false
            }
        });
    },

    closeModal: () => {
        set((state) => ({
            modal: { ...state.modal, isOpen: false, onConfirm: null }
        }));
    },

    confirmAction: () => {
        const { modal } = get();
        if (modal.onConfirm) {
            modal.onConfirm();
        }
        get().closeModal();
    },

    showConfirm: (actionTitleKey, onConfirmCallback) => {
        const state = get();
        const template = state.getConfirmation(actionTitleKey);

        state.openModal({
            type: 'confirm',
            title: template ? template.title : 'CONFIRM ACTION',
            body: template ? template.body : 'Are you sure you want to proceed?',
            onConfirm: onConfirmCallback,
            singleAction: false
        });
    },

    showAlert: (actionOrTitle, body = null) => {
        const state = get();
        // Check if it's a known system alert key
        const template = state.getAlert(actionOrTitle);

        if (template) {
            state.openModal({
                type: 'alert',
                title: template.title,
                body: template.body,
                singleAction: true
            });
        } else {
            // Generic alert
            state.openModal({
                type: 'alert',
                title: typeof actionOrTitle === 'string' ? actionOrTitle : 'SYSTEM ALERT',
                body: body || 'An unexpected event occurred.',
                singleAction: true
            });
        }
    },

    showNotification: (message, type = 'info') => {
        // Clear any existing timeout
        const currentNotif = get().notification;
        if (currentNotif?.timeoutId) {
            clearTimeout(currentNotif.timeoutId);
        }

        const timeoutId = setTimeout(() => {
            get().hideNotification();
        }, 5000);

        set({
            notification: {
                message,
                type,
                visible: true,
                timeoutId
            }
        });
    },

    hideNotification: () => {
        set((state) => ({
            notification: state.notification ? { ...state.notification, visible: false } : null
        }));
    },

    clearNotification: () => {
        set({ notification: null });
    }
}));

export default useUIStore;
