import axios from 'axios';
import { clearAuth, getToken } from './authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a protected call comes back 401, the token is expired or invalid: log the user out.
// Login/register calls are excluded, because a 401 there just means "wrong password".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    const isAuthCall = url.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthCall && getToken()) {
      clearAuth();
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

/** A readable message for any Axios error. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error.response) {
    return 'Cannot reach the server. Please check that the backend is running.';
  }
  return error.response.data?.message || fallback;
}

/** Field-level validation errors from the backend, e.g. { email: "Enter a valid email address" }. */
export function getFieldErrors(error) {
  return error.response?.data?.fieldErrors || {};
}

export default api;
