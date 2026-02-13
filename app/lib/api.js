import axios from 'axios';
import { getCookie } from 'cookies-next';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Añade token automáticamente (solo en cliente)
api.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== 'undefined') {
        const token = getCookie('authToken');
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }
    } catch (e) {
      // No bloqueamos la petición por errores en lectura de cookies
      if (process.env.NODE_ENV !== 'production') console.warn('api interceptor error', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
