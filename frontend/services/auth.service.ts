import api from './api';

export type OAuthProvider = 'google' | 'github';

interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

interface LoginData {
  username: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData) {
    // role is intentionally absent: the server always creates patient accounts.
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  async startOAuth(provider: OAuthProvider) {
    // Returns the provider's authorization URL. The browser is then sent
    // there; the provider calls the backend callback with an auth code.
    const response = await api.get(`/api/auth/oauth/${provider}/start`);
    return response.data.authorize_url as string;
  },

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      // session may already be gone; swallow so the client always clears state
    }
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string) {
    const response = await api.post('/api/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },
};
