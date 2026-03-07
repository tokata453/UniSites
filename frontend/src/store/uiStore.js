import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // ── Toasts ────────────────────────────────────────────────────────
  toasts: [],

  toast: (message, type = 'success', duration = 3500) => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().dismissToast(id), duration);
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // ── Modal ─────────────────────────────────────────────────────────
  modal: null,   // { component, props }
  openModal:  (component, props = {}) => set({ modal: { component, props } }),
  closeModal: () => set({ modal: null }),
}));
