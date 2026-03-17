import { create } from 'zustand';
import { authApi, inboxApi } from '@/api';

export const useInboxStore = create((set, get) => ({
  unreadNotifications: 0,
  unreadMessages: 0,
  loadingSummary: false,
  lastLoadedAt: 0,

  setUnreadNotifications: (count) => set({ unreadNotifications: Number(count || 0) }),
  setUnreadMessages: (count) => set({ unreadMessages: Number(count || 0) }),
  setSummary: ({ unreadNotifications = 0, unreadMessages = 0 }) =>
    set({
      unreadNotifications: Number(unreadNotifications || 0),
      unreadMessages: Number(unreadMessages || 0),
    }),

  refreshSummary: async () => {
    const { loadingSummary, lastLoadedAt } = get();
    if (loadingSummary) return;
    if (Date.now() - lastLoadedAt < 1000) return;

    set({ loadingSummary: true });
    try {
      const [notifRes, convoRes] = await Promise.all([
        authApi.getNotifications(),
        inboxApi.getConversations(),
      ]);

      const unreadNotifications = notifRes.data.unreadCount || 0;
      const unreadMessages = (convoRes.data.conversations || []).reduce(
        (sum, item) => sum + Number(item.unreadCount || 0),
        0
      );

      set({
        unreadNotifications,
        unreadMessages,
        loadingSummary: false,
        lastLoadedAt: Date.now(),
      });
    } catch (_) {
      set({ loadingSummary: false });
    }
  },

  clearSummary: () => set({
    unreadNotifications: 0,
    unreadMessages: 0,
    loadingSummary: false,
    lastLoadedAt: 0,
  }),
}));
