import axios from 'axios'

// ── Create instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request interceptor: attach JWT ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: normalize errors ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Token expired → attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          )
          localStorage.setItem('auth_token',   data.token)
          localStorage.setItem('refresh_token', data.refreshToken)
          api.defaults.headers.common.Authorization = `Bearer ${data.token}`
          originalRequest.headers.Authorization       = `Bearer ${data.token}`
          return api(originalRequest)
        } catch {
          // Refresh failed → force logout
          clearAuthStorage()
          window.location.href = '/login'
          return Promise.reject(error)
        }
      } else {
        clearAuthStorage()
        window.location.href = '/login'
      }
    }

    // Forbidden
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized'
    }

    // Build a normalized error object
    const normalizedError = {
      message: error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'An unexpected error occurred.',
      status:  error.response?.status,
      data:    error.response?.data,
      isAxiosError: true,
    }

    return Promise.reject(normalizedError)
  }
)

function clearAuthStorage() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('auth_user')
}

export default api
