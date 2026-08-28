import axios from 'axios';

// Same-origin by default (frontend + backend share the Vercel domain).
// Local dev overrides it via frontend/.env.local (http://localhost:8000).
// NEXT_PUBLIC_* vars are inlined at build time, so on Vercel leaving the var
// unset/empty gives a relative base URL and /api/* routes through vercel.json.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let refreshPromise: Promise<any> | null = null;

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true })
      .then((response) => response.data)
      .catch((err) => {
        redirectToLogin();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Retry once per request after a silent refresh. HttpOnly cookies are sent
    // automatically, so no token needs to be stored or attached on the client.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshSession();
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
