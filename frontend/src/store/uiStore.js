import { create } from 'zustand';

const useUIStore = create((set, get) => ({
    notification: null, // { message, type: 'success' | 'error' | 'info', visible: boolean }

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
