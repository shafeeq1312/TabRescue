/**
 * Centralized Fetch API Service for TabRescue
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Universal request wrapper using the Fetch API
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

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
    const response = await fetch(url, config);

    // If unauthorized, clean up and dispatch event
    if (response.status === 401) {
      localStorage.removeItem('tabrescue_token');
      localStorage.removeItem('tabrescue_user');
      window.dispatchEvent(new Event('tabrescue:unauthorized'));
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Fetch Error] ${endpoint}:`, error.message);
    throw error;
  }
}

// Authentication Endpoints
export const authApi = {
  register: (name, email, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request('/api/auth/me'),

  updateProfile: (profileData) =>
    request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

// Sessions Endpoints
export const sessionApi = {
  getSessions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.sort) query.append('sort', params.sort);
    if (params.q) query.append('q', params.q);
    const qs = query.toString();
    return request(`/api/sessions${qs ? `?${qs}` : ''}`);
  },

  searchSessions: (q) =>
    request(`/api/sessions/search?q=${encodeURIComponent(q || '')}`),

  getSessionById: (id) => request(`/api/sessions/${id}`),

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

  getStats: () => request('/api/sessions/stats/summary'),
};

// Browser Snapshot (Auto-save) Endpoints
export const snapshotApi = {
  getSnapshot: () => request('/api/snapshot'),

  saveSnapshot: (tabs, windowCount = 1) =>
    request('/api/snapshot', {
      method: 'POST',
      body: JSON.stringify({ tabs, windowCount }),
    }),

  deleteSnapshot: () =>
    request('/api/snapshot', {
      method: 'DELETE',
    }),
};

export default {
  auth: authApi,
  sessions: sessionApi,
  snapshot: snapshotApi,
};
