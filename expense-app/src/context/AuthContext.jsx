import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import authService from '../services/authService.js'

// ── Types ──────────────────────────────────────────────────────────────────
export const ROLES = /** @type {const} */ ({
  ADMIN:    'admin',
  MANAGER:  'manager',
  EMPLOYEE: 'employee',
})

// ── State shape ───────────────────────────────────────────────────────────
const initialState = {
  user:          null,    // { id, name, email, avatar, ... }
  token:         null,    // JWT access token
  refreshToken:  null,
  role:          null,    // 'admin' | 'manager' | 'employee'
  isAuthenticated: false,
  isLoading:     true,    // true while rehydrating from storage
  error:         null,
}

// ── Reducer ───────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        user:            action.payload.user,
        token:           action.payload.token,
        refreshToken:    action.payload.refreshToken,
        role:            action.payload.role,
        isAuthenticated: !!action.payload.token,
        isLoading:       false,
        error:           null,
      }

    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      persistAuth(action.payload)
      return {
        ...state,
        user:            action.payload.user,
        token:           action.payload.token,
        refreshToken:    action.payload.refreshToken,
        role:            action.payload.role ?? action.payload.user?.role ?? ROLES.EMPLOYEE,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      }

    case 'LOGOUT':
      clearAuth()
      return { ...initialState, isLoading: false }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }

    default:
      return state
  }
}

// ── Storage helpers ────────────────────────────────────────────────────────
function persistAuth({ token, refreshToken, user, role }) {
  if (token)        localStorage.setItem('auth_token',    token)
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
  if (user)         localStorage.setItem('auth_user',     JSON.stringify(user))
  if (role)         localStorage.setItem('auth_role',     role)
}

function clearAuth() {
  ;['auth_token', 'refresh_token', 'auth_user', 'auth_role'].forEach((k) =>
    localStorage.removeItem(k)
  )
}

function readStoredAuth() {
  try {
    return {
      token:        localStorage.getItem('auth_token')    ?? null,
      refreshToken: localStorage.getItem('refresh_token') ?? null,
      user:         JSON.parse(localStorage.getItem('auth_user') ?? 'null'),
      role:         localStorage.getItem('auth_role')     ?? null,
    }
  } catch {
    return { token: null, refreshToken: null, user: null, role: null }
  }
}

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ── Provider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = readStoredAuth()
    dispatch({ type: 'INIT', payload: stored })
  }, [])

  // ── login ────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    try {
      const data = await authService.login(credentials)
      dispatch({ type: 'LOGIN_SUCCESS', payload: data })
      return { success: true }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      return { success: false, error: err.message }
    }
  }, [])

  // ── signup ───────────────────────────────────────────────────────────
  const signup = useCallback(async (payload) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    try {
      const data = await authService.signup(payload)
      dispatch({ type: 'SIGNUP_SUCCESS', payload: data })
      return { success: true }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      return { success: false, error: err.message }
    }
  }, [])

  // ── googleLogin ──────────────────────────────────────────────────────
  const googleLogin = useCallback(async (credential) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    try {
      const data = await authService.googleLogin({ credential })
      dispatch({ type: 'LOGIN_SUCCESS', payload: data })
      return { success: true }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      return { success: false, error: err.message }
    }
  }, [])

  // ── logout ───────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authService.logout()
    dispatch({ type: 'LOGOUT' })
  }, [])

  // ── helpers ──────────────────────────────────────────────────────────
  const clearError  = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [])
  const updateUser  = useCallback((data) => dispatch({ type: 'UPDATE_USER', payload: data }), [])

  const hasRole = useCallback(
    (roles) => {
      if (!state.role) return false
      const arr = Array.isArray(roles) ? roles : [roles]
      return arr.includes(state.role)
    },
    [state.role]
  )

  const isAdmin    = state.role === ROLES.ADMIN
  const isManager  = state.role === ROLES.MANAGER || state.role === ROLES.ADMIN
  const isEmployee = !!state.role

  const value = useMemo(
    () => ({
      // State
      user:            state.user,
      token:           state.token,
      role:            state.role,
      isAuthenticated: state.isAuthenticated,
      isLoading:       state.isLoading,
      error:           state.error,
      // Role booleans
      isAdmin,
      isManager,
      isEmployee,
      // Actions
      login,
      signup,
      googleLogin,
      logout,
      clearError,
      updateUser,
      hasRole,
    }),
    [state, isAdmin, isManager, isEmployee, login, signup, googleLogin, logout, clearError, updateUser, hasRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthContext
