// API Client for VoyageAI connecting to the Node.js/PostgreSQL backend
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('voyageai_jwt_token');
    await sleep(800) // Simulate network latency

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('voyageai_jwt_token');
      localStorage.removeItem('voyageai_user');
    }

    const contentType = response.headers.get("content-type");
    const data = (contentType && contentType.includes("application/json")) ? await response.json() : null;

    if (!response.ok) throw new Error(data?.message || 'API request failed');
    return data;
  }
};

// Compatibility mock wrapper mapping Supabase query builder syntax to backend REST API
export const supabase = {
  auth: {
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => { } } },
    }),
    resetPasswordForEmail: async (email, options) => {
      try {
        const data = await api.request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, ...options }) });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    updateUser: async (attrs) => {
      try {
        const data = await api.request('/api/auth/update-user', { method: 'PATCH', body: JSON.stringify(attrs) });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
  },
  from: (table) => {
    let queryParams = {};
    let currentMethod = 'GET';
    let requestData = null;

    const builder = {
      select: (columns = '*') => {
        currentMethod = 'GET';
        return builder;
      },
      insert: (data) => {
        currentMethod = 'POST';
        // Handle array of insertions
        requestData = Array.isArray(data) ? data[0] : data;
        return builder;
      },
      update: (data) => {
        currentMethod = 'PATCH';
        requestData = data;
        return builder;
      },
      upsert: (data) => {
        currentMethod = 'PUT';
        requestData = data;
        return builder;
      },
      delete: () => {
        currentMethod = 'DELETE';
        return builder;
      },
      eq: (col, val) => {
        queryParams[col] = val;
        return builder;
      },
      order: (col, options) => {
        // Mock chainable, no-op for client-side sorting since backend does it
        return builder;
      },
      // Chaining then implementation to support Supabase promise resolution
      then: (resolve, reject) => {
        // Construct query parameters
        let queryString = Object.keys(queryParams)
          .map(k => `${encodeURIComponent(k === 'id' ? 'id' : k)}=${encodeURIComponent(queryParams[k])}`)
          .join('&');

        let endpoint = `/api/${table}${queryString ? '?' + queryString : ''}`;

        let options = { method: currentMethod };
        if (requestData) {
          options.body = JSON.stringify(requestData);
        }

        return api.request(endpoint, options)
          .then(res => {
            // Supabase returns `{ data, error }`
            const output = { data: res, error: null };
            if (resolve) resolve(output);
            return output;
          })
          .catch(err => {
            console.error(`Supabase mock error on ${table}:`, err);
            const output = { data: null, error: err };
            if (resolve) resolve(output); // Resolve with error key for safety in client code
            return output;
          });
      },
      maybeSingle: async () => {
        let queryString = Object.keys(queryParams)
          .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
          .join('&');

        let endpoint = `/api/${table}${queryString ? '?' + queryString : ''}${queryString ? '&' : '?'}single=true`;

        try {
          const data = await api.request(endpoint, { method: currentMethod });
          return { data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    };
    return builder;
  }
};

export const hasSupabase = true;
export default api;
