import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      // Called after login / OAuth callback
      setAuth: (user, token) => set({ user, token }),

      // Update user fields (e.g. after profile update)
      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          await authApi.logout();
        } catch (err) {
          console.error("Logout failed", err);
        } finally {
          set({ user: null, token: null });
        }
      },

      // Helpers
      isAuthenticated: () => !!get().token,
      isStudent:       () => get().user?.Role?.name === 'student',
      isOwner:         () => get().user?.Role?.name === 'owner',
      isAdmin:         () => get().user?.Role?.name === 'admin',
    }),
    {
      name:    'unisites-auth',   // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
