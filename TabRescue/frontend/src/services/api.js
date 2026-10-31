
/**
 * Centralized Fetch API Service for TabRescue
 */

// Render Backend URL
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  'https://tabrescue-1.onrender.com'
).replace(/\/+$/, '');

/**
 * Universal request wrapper using Fetch API
 */
async function request(endpoint, options = {}) {
  // Remove leading slash to avoid double slash
  const cleanEndpoint = endpoint.replace(/^\/+/, '');

  const url = `${API_BASE}/${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach token if present
  const token = localStorage.getItem('tabrescue_token');

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    console.log('[API Request]:', options.method || 'GET', url);

    const response = await fetch(url, config);

    // Handle unauthorized requests
    if (response.status === 401) {
      localStorage.removeItem('tabrescue_token');
      localStorage.removeItem('tabrescue_user');

      window.dispatchEvent(
        new Event('tabrescue:unauthorized')
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `HTTP Error ${response.status}`
      );
    }

    return data;

  } catch (error) {
    console.error(
      `[API Fetch Error] ${endpoint}:`,
      error.message
    );

    throw error;
  }
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

export const authApi = {
  register: (name, email, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }),

  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  getMe: () =>
    request('/api/auth/me'),

  updateProfile: (profileData) =>
    request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

// ==========================================
// SESSIONS ENDPOINTS
// ==========================================

export const sessionApi = {
  getSessions: (params = {}) => {
    const query = new URLSearchParams();

    if (params.category && params.category !== 'All') {
      query.append('category', params.category);
    }

    if (params.sort) {
      query.append('sort', params.sort);
    }

    if (params.q) {
      query.append('q', params.q);
    }

    const qs = query.toString();

    return request(
      `/api/sessions${qs ? `?${qs}` : ''}`
    );
  },

  searchSessions: (q) =>
    request(
      `/api/sessions/search?q=${encodeURIComponent(q || '')}`
    ),

  getSessionById: (id) =>
    request(`/api/sessions/${id}`),

  createSession: (sessionData) =>
    request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  updateSession: (id, sessionData) =>
    request(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    }),

  deleteSession: (id) =>
    request(`/api/sessions/${id}`, {
      method: 'DELETE',
    }),

  bulkDelete: (ids) =>
    request('/api/sessions/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  restoreSession: (id) =>
    request(`/api/sessions/${id}/restore`, {
      method: 'POST',
    }),

  getStats: () =>
    request('/api/sessions/stats/summary'),
};

// ==========================================
// BROWSER SNAPSHOT ENDPOINTS
// ==========================================

export const snapshotApi = {
  getSnapshot: () =>
    request('/api/snapshot'),

  saveSnapshot: (tabs, windowCount = 1) =>
    request('/api/snapshot', {
      method: 'POST',
      body: JSON.stringify({
        tabs,
        windowCount,
      }),
    }),

  deleteSnapshot: () =>
    request('/api/snapshot', {
      method: 'DELETE',
    }),
};

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default {
  auth: authApi,
  sessions: sessionApi,
  snapshot: snapshotApi,
};
