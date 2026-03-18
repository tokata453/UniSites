import { create } from 'zustand';
import { authApi, inboxApi } from '@/api';

const SUMMARY_COOLDOWN_MS = 30_000;
const RATE_LIMIT_BACKOFF_MS = 60_000;

let summaryRequest = null;

const readRetryAfterMs = (headers = {}) => {
  const value = headers['retry-after'] || headers['Retry-After'];
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
  return RATE_LIMIT_BACKOFF_MS;
};

export const useInboxStore = create((set, get) => ({
  unreadNotifications: 0,
  unreadMessages: 0,
  loadingSummary: false,
  lastLoadedAt: 0,
  rateLimitedUntil: 0,

  setUnreadNotifications: (count) => set({ unreadNotifications: Number(count || 0) }),
  setUnreadMessages: (count) => set({ unreadMessages: Number(count || 0) }),
  setSummary: ({ unreadNotifications = 0, unreadMessages = 0 }) =>
    set({
      unreadNotifications: Number(unreadNotifications || 0),
      unreadMessages: Number(unreadMessages || 0),
    }),

  refreshSummary: async ({ force = false } = {}) => {
    const { lastLoadedAt, rateLimitedUntil } = get();
    const now = Date.now();

    if (!force && now < rateLimitedUntil) return summaryRequest;
    if (!force && now - lastLoadedAt < SUMMARY_COOLDOWN_MS) return summaryRequest;
    if (summaryRequest) return summaryRequest;

    set({ loadingSummary: true });

    summaryRequest = Promise.all([
      authApi.getNotifications(),
      inboxApi.getConversations(),
    ])
      .then(([notifRes, convoRes]) => {
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
          rateLimitedUntil: 0,
        });
      })
      .catch((err) => {
        const isRateLimited = err?.response?.status === 429;
        set({
          loadingSummary: false,
          ...(isRateLimited
            ? { rateLimitedUntil: Date.now() + readRetryAfterMs(err.response?.headers) }
            : {}),
        });
      })
      .finally(() => {
        summaryRequest = null;
      });

    return summaryRequest;
  },

  clearSummary: () => set({
    unreadNotifications: 0,
    unreadMessages: 0,
    loadingSummary: false,
    lastLoadedAt: 0,
    rateLimitedUntil: 0,
  }),
}));
