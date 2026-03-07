import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '../store/uiStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — auto logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    useUIStore.getState().toast({
      message,
      type: "error",
    });
    return Promise.reject(err);
  }
);

export default api;
