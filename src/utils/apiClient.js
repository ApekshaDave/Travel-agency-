// API Client for VoyageAI connecting to the Node.js/PostgreSQL backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('voyageai_jwt_token')

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Attach status to errors so AuthContext can tell 401 apart from network failures
    if (response.status === 401 || response.status === 403) {
      const err = new Error('Session expired. Please sign in again.')
      err.status = response.status
      throw err
    }

    const contentType = response.headers.get('content-type')
    const data = contentType?.includes('application/json')
      ? await response.json()
      : null

    if (!response.ok) {
      const err = new Error(data?.message || 'API request failed')
      err.status = response.status
      throw err
    }

    return data
  }
}

// Compatibility mock mapping Supabase query-builder syntax to backend REST API
export const supabase = {
  auth: {
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    resetPasswordForEmail: async (email, options) => {
      try {
        const data = await api.request('/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ email, ...options })
        })
        return { data, error: null }
      } catch (error) {
        return { data: null, error }
      }
    },
    updateUser: async (attrs) => {
      try {
        const data = await api.request('/api/auth/update-user', {
          method: 'PATCH',
          body: JSON.stringify(attrs)
        })
        return { data, error: null }
      } catch (error) {
        return { data: null, error }
      }
    },
  },

  from: (table) => {
    let queryParams = {}
    let currentMethod = 'GET'
    let requestData = null

    const builder = {
      select: () => { currentMethod = 'GET'; return builder },
      insert: (data) => {
        currentMethod = 'POST'
        requestData = Array.isArray(data) ? data[0] : data
        return builder
      },
      update: (data) => { currentMethod = 'PATCH'; requestData = data; return builder },
      upsert: (data) => { currentMethod = 'PUT'; requestData = data; return builder },
      delete: () => { currentMethod = 'DELETE'; return builder },
      eq: (col, val) => { queryParams[col] = val; return builder },
      order: () => builder,
      single: () => builder,

      then: (resolve) => {
        const queryString = Object.keys(queryParams)
          .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
          .join('&')

        const endpoint = `/api/${table}${queryString ? '?' + queryString : ''}`
        const options = { method: currentMethod }
        if (requestData) options.body = JSON.stringify(requestData)

        return api.request(endpoint, options)
          .then(res => {
            const output = { data: res, error: null }
            if (resolve) resolve(output)
            return output
          })
          .catch(err => {
            console.error(`Supabase mock error on ${table}:`, err)
            const output = { data: null, error: err }
            if (resolve) resolve(output)
            return output
          })
      },

      maybeSingle: async () => {
        const queryString = Object.keys(queryParams)
          .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
          .join('&')
        const endpoint = `/api/${table}${queryString ? '?' + queryString : ''}${queryString ? '&' : '?'}single=true`
        try {
          const data = await api.request(endpoint, { method: currentMethod })
          return { data, error: null }
        } catch (err) {
          return { data: null, error: err }
        }
      }
    }
    return builder
  }
}

export const hasSupabase = true
export default api