import { create } from 'zustand'
import api from '../api/axiosInstance'

const useTripStore = create((set, get) => ({
  // Search params
  searchParams: {
    source: '',
    destination: '',
    date: '',
    mode: 'flight',
    duration: 3,
  },

  // Quick briefing data
  briefing: null,

  // SSE streaming
  streamingData: {
    weather: null,
    country: null,
    currency: null,
    news: null,
    flights: null,
    route: null,
    carbon: null,
  },
  isStreaming: false,
  streamDone: false,

  // Saved trips
  savedTrips: [],
  savedPagination: null,

  // UI state
  loading: false,
  error: null,

  // Actions
  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),

  fetchQuickBriefing: async (params) => {
    set({ loading: true, error: null, briefing: null })
    try {
      const res = await api.get('/trip/quick', { params })
      set({ briefing: res.data, loading: false })
      return res.data
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch briefing',
        loading: false
      })
      return null
    }
  },

  startStream: async (params) => {
    set({
      streamingData: {
        weather: null, country: null, currency: null,
        news: null, flights: null, route: null, carbon: null,
      },
      isStreaming: true,
      streamDone: false,
      error: null
    })

    const fetchStream = async (retried = false) => {
      let token = localStorage.getItem('accessToken')
      const query = new URLSearchParams(params).toString()
      const url = `${import.meta.env.VITE_API_URL}/trip/stream?${query}`

      console.log('Fetching stream, token:', token ? token.slice(0, 20) + '...' : 'missing')

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream'
        }
      })

      console.log('Response status:', response.status)

      // If 401 and not already retried — refresh token and retry
      if (response.status === 401 && !retried) {
        console.log('Token expired, refreshing...')
        try {
          const refreshRes = await fetch(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            {
              method: 'POST',
              credentials: 'include'
            }
          )
          const refreshData = await refreshRes.json()
          if (refreshData.accessToken) {
            localStorage.setItem('accessToken', refreshData.accessToken)
            console.log('Token refreshed, retrying stream...')
            return fetchStream(true)
          }
        } catch (err) {
          console.error('Token refresh failed:', err)
        }
        set({ isStreaming: false, streamDone: true })
        return
      }

      if (!response.ok) {
        console.error('Stream failed with status:', response.status)
        set({ isStreaming: false, streamDone: true })
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        let currentEvent = null
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ') && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6))
              console.log('Event received:', currentEvent, data)
              if (currentEvent === 'done') {
                set({ isStreaming: false, streamDone: true })
              } else {
                set((state) => ({
                  streamingData: { ...state.streamingData, [currentEvent]: data }
                }))
              }
            } catch {}
            currentEvent = null
          }
        }
      }

      set({ isStreaming: false, streamDone: true })
    }

    try {
      await fetchStream()
    } catch (err) {
      console.error('Stream error:', err)
      set({ isStreaming: false, streamDone: true })
    }
  },

  stopStream: () => {
    set({ isStreaming: false })
  },

  saveTrip: async (tripData) => {
    try {
      const res = await api.post('/trip/create', tripData)
      return res.data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to save trip' })
      return null
    }
  },

  fetchSavedTrips: async (page = 1) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/trip/saved', { params: { page, limit: 10 } })
      set({
        savedTrips: res.data.trips,
        savedPagination: res.data.pagination,
        loading: false
      })
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch saved trips',
        loading: false
      })
    }
  },

  deleteTrip: async (tripId) => {
    try {
      await api.delete(`/trip/${tripId}`)
      set((state) => ({
        savedTrips: state.savedTrips.filter((t) => t._id !== tripId)
      }))
      return true
    } catch {
      return false
    }
  },

  clearBriefing: () => set({
    briefing: null,
    streamingData: {
      weather: null, country: null, currency: null,
      news: null, flights: null, route: null, carbon: null,
    },
    streamDone: false,
    isStreaming: false
  }),

  clearError: () => set({ error: null }),
}))

export default useTripStore
