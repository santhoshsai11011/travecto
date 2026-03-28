import { create } from 'zustand'
import api from '../api/axiosInstance'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthChecked: false,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('accessToken', res.data.accessToken)
      set({
        user: res.data.user,
        isAuthenticated: true,
        isAuthChecked: true,
        loading: false
      })
      return true
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Login failed',
        isAuthChecked: true,
        loading: false
      })
      return false
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      await api.post('/auth/register', { name, email, password })
      set({ loading: false })
      return true
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Registration failed',
        loading: false
      })
      return false
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    localStorage.removeItem('accessToken')
    set({ user: null, isAuthenticated: false, isAuthChecked: true })
  },

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ isAuthenticated: false, isAuthChecked: true, user: null })
      return
    }

    // Token exists — try to get user info by refreshing
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include'
        }
      )
      const data = await res.json()
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
        // Decode token to get user info
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]))
        set({
          isAuthenticated: true,
          isAuthChecked: true,
          user: { id: payload.id, email: payload.email, role: payload.role }
        })
      } else {
        localStorage.removeItem('accessToken')
        set({ isAuthenticated: false, isAuthChecked: true, user: null })
      }
    } catch {
      // Token might still be valid even if refresh fails
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        set({
          isAuthenticated: true,
          isAuthChecked: true,
          user: { id: payload.id, email: payload.email, role: payload.role }
        })
      } catch {
        localStorage.removeItem('accessToken')
        set({ isAuthenticated: false, isAuthChecked: true, user: null })
      }
    }
  },
}))

export default useAuthStore
