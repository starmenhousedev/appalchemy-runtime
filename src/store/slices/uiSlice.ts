import { StateCreator } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface UiSlice {
  toasts: ToastMessage[];
  isDrawerOpen: boolean;
  showToast: (type: ToastMessage['type'], message: string) => void;
  dismissToast: (id: string) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set, _get) => ({
  toasts: [],
  isDrawerOpen: false,

  showToast: (type, message) => {
    const id = Date.now().toString();
    set(state => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    setTimeout(() => {
      set(state => ({
        toasts: state.toasts.filter(t => t.id !== id),
      }));
    }, 3000);
  },

  dismissToast: (id: string) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  toggleDrawer: () => {
    set(state => ({ isDrawerOpen: !state.isDrawerOpen }));
  },

  setDrawerOpen: (open: boolean) => {
    set({ isDrawerOpen: open });
  },
});
