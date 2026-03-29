import api from './api.js'

/**
 * Auth service — all calls go through the shared axios instance
 * which handles token attachment and 401 refresh automatically.
 */
const authService = {
  /**
   * Login with email + password.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user, token, refreshToken, role }>}
   */
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    return data
  },

  /**
   * Register a new user.
   * @param {{ name: string, email: string, password: string, country: string }} payload
   */
  signup: async (payload) => {
    const { data } = await api.post('/auth/signup', payload)
    return data
  },

  /**
   * Exchange a Google OAuth code / credential for a JWT.
   * @param {{ credential: string }} payload
   */
  googleLogin: async (payload) => {
    const { data } = await api.post('/auth/google', payload)
    return data
  },

  /**
   * Fetch the authenticated user's profile.
   */
  me: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },

  /**
   * Logout — invalidate refresh token on the server.
   */
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    await api.post('/auth/logout', { refreshToken }).catch(() => {
      // Swallow — we always clear local state regardless
    })
  },

  /**
   * Request a password-reset email.
   * @param {{ email: string }} payload
   */
  forgotPassword: async (payload) => {
    const { data } = await api.post('/auth/forgot-password', payload)
    return data
  },

  /**
   * Confirm password reset with token.
   * @param {{ token: string, password: string }} payload
   */
  resetPassword: async (payload) => {
    const { data } = await api.post('/auth/reset-password', payload)
    return data
  },
}

export default authService
