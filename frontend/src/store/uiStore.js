import { create } from 'zustand';

const useUIStore = create((set, get) => ({
    notification: null, // { message, type: 'success' | 'error' | 'info', visible: boolean }
    systemMessages: null,

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

    showAlert: (action) => {
        const state = get();
        const template = state.getAlert(action);
        const alertMsg = template
            ? `${template.title}\n----------------------------------\n${template.body}`
            : `SYSTEM ALERT: ${action.toUpperCase()} - OPERATIONAL FAILURE`;
        window.alert(alertMsg);
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
