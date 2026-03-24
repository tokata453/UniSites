import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore }   from '@/store/uiStore';
import { authApi }      from '@/api';

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user:                 store.user,
    token:                store.token,
    isAuthenticated:      store.isAuthenticated(),
    isStudent:            store.isStudent(),
    isUniversityOwner:    store.isUniversityOwner(),
    isOrganizationOwner:  store.isOrganizationOwner(),
    isAdmin:              store.isAdmin(),
    setAuth:              store.setAuth,
    setUser:              store.setUser,
    logout:               store.logout,
  };
};

// ── Toast helper ──────────────────────────────────────────────────────────────
export const useToast = () => {
  const { toast } = useUIStore();
  const success = useCallback((msg) => toast(msg, 'success'), [toast]);
  const error = useCallback((msg) => toast(msg, 'error'), [toast]);
  const info = useCallback((msg) => toast(msg, 'info'), [toast]);

  return useMemo(() => ({
    success,
    error,
    info,
  }), [error, info, success]);
};

// ── Generic data fetcher ──────────────────────────────────────────────────────
export const useFetch = (apiFn, deps = [], { immediate = true } = {}) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => {
    if (immediate) execute();
  }, [immediate]); // eslint-disable-line

  return { data, loading, error, execute, setData };
};

// ── Refresh current user from /me ─────────────────────────────────────────────
export const useRefreshUser = () => {
  const { setUser } = useAuthStore();
  return async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.user);
    } catch {
      return null;
    }
  };
};

// ── Pagination helper ─────────────────────────────────────────────────────────
export const usePagination = (initialPage = 1, initialLimit = 12) => {
  const [page,  setPage]  = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);
  const hasNext    = page < totalPages;
  const hasPrev    = page > 1;

  return {
    page, setPage, limit, setLimit,
    total, setTotal,
    totalPages, hasNext, hasPrev,
    nextPage: () => hasNext && setPage((p) => p + 1),
    prevPage: () => hasPrev && setPage((p) => p - 1),
  };
};
