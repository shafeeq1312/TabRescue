/**
 * TabRescue Chrome Extension Popup Script (Manifest V3)
 */

let state = {
  apiUrl: 'http://localhost:5000',
  token: null,
  user: null,
  autoSaveEnabled: false,
  currentTabs: [],
  duplicateCount: 0,
};

// Excluded browser URL prefixes
const EXCLUDED_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'chrome-devtools://',
  'edge://',
  'about:',
  'view-source:',
  'javascript:',
  'data:',
  'file://',
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupEventListeners();
  await loadStoredState();
  await refreshCurrentTabs();
  if (state.token) {
    loadRecentSessions();
  }
});

/**
 * Switch tabs in the popup UI
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const panes = document.querySelectorAll('.tab-pane');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      navButtons.forEach((b) => b.classList.remove('active'));
      panes.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');

      if (targetId === 'recentTab' && state.token) {
        loadRecentSessions();
      }
    });
  });

  // Shortcut from banner to settings tab
  const goToSettingsBtn = document.getElementById('goToSettingsBtn');
  if (goToSettingsBtn) {
    goToSettingsBtn.addEventListener('click', () => {
      document.querySelector('[data-tab="settingsTab"]').click();
    });
  }
}

/**
 * Load saved configuration and auth from chrome.storage.local
 */
async function loadStoredState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['apiUrl', 'token', 'user', 'autoSaveEnabled', 'lastSnapshotTime'],
      (data) => {
        state.apiUrl = data.apiUrl || 'http://localhost:5000';
        state.token = data.token || null;
        state.user = data.user || null;
        state.autoSaveEnabled = data.autoSaveEnabled !== false; // Enabled by default

        // Sync inputs
        const apiUrlInput = document.getElementById('apiUrlInput');
        if (apiUrlInput) apiUrlInput.value = state.apiUrl;

        const autoSaveToggle = document.getElementById('autoSaveToggle');
        if (autoSaveToggle) autoSaveToggle.checked = state.autoSaveEnabled;

        updateAuthUI();
        updateAutoSaveUI(data.lastSnapshotTime);

        // Immediate background sync when popup opens
        if (state.token && state.autoSaveEnabled) {
          chrome.runtime.sendMessage({ type: 'TRIGGER_MANUAL_SNAPSHOT' });
        }

        resolve();
      }
    );
  });
}

/**
 * Update UI according to auth state
 */
function updateAuthUI() {
  const badge = document.getElementById('connectionBadge');
  const authBanner = document.getElementById('authRequiredBanner');
  const accountInfo = document.getElementById('accountInfo');
  const loginFormContainer = document.getElementById('loginFormContainer');
  const userNameEl = document.getElementById('connectedUserName');
  const userEmailEl = document.getElementById('connectedUserEmail');

  if (state.token && state.user) {
    badge.textContent = 'Connected';
    badge.className = 'badge badge-connected';
    authBanner.classList.add('hidden');

    accountInfo.classList.remove('hidden');
    loginFormContainer.classList.add('hidden');
    userNameEl.textContent = state.user.name || 'User';
    userEmailEl.textContent = state.user.email || '';
  } else {
    badge.textContent = 'Offline';
    badge.className = 'badge badge-disconnected';
    authBanner.classList.remove('hidden');

    accountInfo.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
  }
}

/**
 * Update auto-save UI labels
 */
function updateAutoSaveUI(lastSnapshotTime) {
  const statusText = document.getElementById('snapshotStatusText');
  if (!statusText) return;

  if (state.autoSaveEnabled) {
    if (lastSnapshotTime) {
      const timeStr = new Date(lastSnapshotTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      statusText.textContent = `Active (Last synced at ${timeStr})`;
    } else {
      statusText.textContent = 'Active (Watching tabs)';
    }
  } else {
    statusText.textContent = 'Disabled';
  }
}

/**
 * Collect tabs from current window, filter internal and find duplicates
 */
async function refreshCurrentTabs() {
  try {
    const rawTabs = await chrome.tabs.query({ currentWindow: true });

    const seenUrls = new Set();
    const validTabs = [];
    let duplicates = 0;

    rawTabs.forEach((tab) => {
      const url = (tab.url || '').trim();

      // Check excluded schemes
      const isInternal = EXCLUDED_PREFIXES.some((prefix) =>
        url.toLowerCase().startsWith(prefix)
      );
      const isWebStore =
        url.includes('chrome.google.com/webstore') ||
        url.includes('chromewebstore.google.com');

      if (!url || isInternal || isWebStore) {
        return;
      }

      // Check duplicates
      const normalizedUrl = url.replace(/\/+$/, '');
      if (seenUrls.has(normalizedUrl)) {
        duplicates++;
        return;
      }
      seenUrls.add(normalizedUrl);

      // Safe favicon
      let favicon = tab.favIconUrl || '';
      if (!favicon) {
        try {
          const parsed = new URL(url);
          favicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
        } catch (e) {
          favicon = '';
        }
      }

      validTabs.push({
        title: tab.title || 'Untitled Page',
        url: url,
        favicon: favicon,
        position: tab.index,
      });
    });

    state.currentTabs = validTabs;
    state.duplicateCount = duplicates;

    // Update Counter
    const tabCountBadge = document.getElementById('tabCountBadge');
    if (tabCountBadge) tabCountBadge.textContent = validTabs.length;

    // Update Duplicate Alert
    const duplicateAlert = document.getElementById('duplicateAlert');
    const duplicateCountText = document.getElementById('duplicateCountText');
    if (duplicates > 0) {
      duplicateCountText.textContent = `${duplicates} duplicate tab${duplicates > 1 ? 's' : ''} detected & will be merged`;
      duplicateAlert.classList.remove('hidden');
    } else {
      duplicateAlert.classList.add('hidden');
    }

    // Populate preview
    renderTabsPreview(validTabs);

    // Set intelligent default name if empty
    const sessionNameInput = document.getElementById('sessionNameInput');
    if (sessionNameInput && !sessionNameInput.value) {
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (validTabs.length > 0) {
        try {
          const host = new URL(validTabs[0].url).hostname.replace('www.', '');
          sessionNameInput.value = `${capitalize(host.split('.')[0])} & Tabs (${timeStr})`;
        } catch (e) {
          sessionNameInput.value = `Session – ${timeStr}`;
        }
      } else {
        sessionNameInput.value = `Session – ${timeStr}`;
      }
    }
  } catch (err) {
    console.error('Error refreshing tabs:', err);
    showToast('Could not query current browser tabs', 'error');
  }
}

/**
 * Render tabs preview in popup
 */
function renderTabsPreview(tabs) {
  const container = document.getElementById('tabsList');
  if (!container) return;

  if (tabs.length === 0) {
    container.innerHTML = `
      <div style="padding: 10px; color: var(--text-muted); text-align: center; font-size: 11px;">
        No restorable web tabs open in this window.
      </div>
    `;
    return;
  }

  container.innerHTML = tabs
    .map(
      (tab) => `
      <div class="tab-preview-item" title="${escapeHtml(tab.url)}">
        <img
          src="${tab.favicon || 'icons/icon16.png'}"
          onerror="this.src='icons/icon16.png'"
          alt=""
        />
        <span class="tab-preview-title">${escapeHtml(tab.title)}</span>
      </div>
    `
    )
    .join('');
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Refresh tabs button
  const refreshTabsBtn = document.getElementById('refreshTabsBtn');
  if (refreshTabsBtn) {
    refreshTabsBtn.addEventListener('click', () => {
      refreshCurrentTabs();
      showToast('Tabs refreshed', 'info');
    });
  }

  // Save Session Form Submit
  const saveForm = document.getElementById('saveSessionForm');
  if (saveForm) {
    saveForm.addEventListener('submit', handleSaveSession);
  }

  // Open Web Dashboard
  const openDashboardBtn = document.getElementById('openDashboardBtn');
  if (openDashboardBtn) {
    openDashboardBtn.addEventListener('click', () => {
      const clientUrl = state.apiUrl.replace(':5000', ':5173');
      chrome.tabs.create({ url: `${clientUrl}/dashboard` });
    });
  }

  // Refresh Recent Sessions
  const refreshRecentBtn = document.getElementById('refreshRecentBtn');
  if (refreshRecentBtn) {
    refreshRecentBtn.addEventListener('click', () => {
      loadRecentSessions();
    });
  }

  // Login Form
  const extLoginForm = document.getElementById('extensionLoginForm');
  if (extLoginForm) {
    extLoginForm.addEventListener('submit', handleExtensionLogin);
  }

  // Sync Token Connect
  const saveTokenBtn = document.getElementById('saveTokenBtn');
  if (saveTokenBtn) {
    saveTokenBtn.addEventListener('click', handleTokenConnect);
  }

  // Disconnect
  const disconnectBtn = document.getElementById('disconnectBtn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', handleDisconnect);
  }

  // Save API URL
  const saveApiUrlBtn = document.getElementById('saveApiUrlBtn');
  if (saveApiUrlBtn) {
    saveApiUrlBtn.addEventListener('click', () => {
      const input = document.getElementById('apiUrlInput');
      const newUrl = (input.value || '').trim().replace(/\/+$/, '');
      if (!newUrl) return showToast('Please enter a valid URL', 'error');

      chrome.storage.local.set({ apiUrl: newUrl }, () => {
        state.apiUrl = newUrl;
        showToast('API URL saved successfully', 'success');
      });
    });
  }

  // Auto-Save Toggle
  const autoSaveToggle = document.getElementById('autoSaveToggle');
  if (autoSaveToggle) {
    autoSaveToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      state.autoSaveEnabled = enabled;

      chrome.storage.local.set({ autoSaveEnabled: enabled }, () => {
        // Notify service worker
        chrome.runtime.sendMessage({
          type: 'TOGGLE_AUTOSAVE',
          enabled,
        });

        updateAutoSaveUI();
        showToast(
          enabled ? 'Auto-save snapshots enabled' : 'Auto-save snapshots disabled',
          'info'
        );
      });
    });
  }
}

/**
 * Handle Save Current Session
 */
async function handleSaveSession(e) {
  e.preventDefault();

  if (!state.token) {
    showToast('Please connect your TabRescue account in Settings first.', 'error');
    document.querySelector('[data-tab="settingsTab"]').click();
    return;
  }

  if (state.currentTabs.length === 0) {
    showToast('No restorable tabs found in this window.', 'error');
    return;
  }

  const nameInput = document.getElementById('sessionNameInput');
  const categorySelect = document.getElementById('sessionCategorySelect');
  const descInput = document.getElementById('sessionDescInput');
  const saveBtn = document.getElementById('saveSessionBtn');

  const name = nameInput.value.trim();
  const category = categorySelect.value;
  const description = descInput ? descInput.value.trim() : '';

  // Button loading state
  saveBtn.disabled = true;
  saveBtn.querySelector('.btn-text').classList.add('hidden');
  saveBtn.querySelector('.btn-loader').classList.remove('hidden');

  try {
    const response = await fetch(`${state.apiUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({
        name,
        category,
        description,
        tabs: state.currentTabs,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save session');
    }

    showToast(`Session "${name}" saved with ${data.meta?.totalTabs || state.currentTabs.length} tabs!`, 'success');

    // Reset name
    nameInput.value = '';
    if (descInput) descInput.value = '';
    await refreshCurrentTabs();

    // Switch to Saved tab after a short delay
    setTimeout(() => {
      document.querySelector('[data-tab="recentTab"]').click();
    }, 600);
  } catch (error) {
    console.error('Save session error:', error);
    showToast(error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.querySelector('.btn-text').classList.remove('hidden');
    saveBtn.querySelector('.btn-loader').classList.add('hidden');
  }
}

/**
 * Load Recent Sessions from Backend
 */
async function loadRecentSessions() {
  const loader = document.getElementById('recentSessionsLoader');
  const list = document.getElementById('recentSessionsList');
  const empty = document.getElementById('recentEmptyState');

  if (!state.token) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  loader.classList.remove('hidden');
  list.innerHTML = '';
  empty.classList.add('hidden');

  try {
    const [sessRes, snapRes] = await Promise.allSettled([
      fetch(`${state.apiUrl}/api/sessions`, {
        headers: { Authorization: `Bearer ${state.token}` },
      }),
      fetch(`${state.apiUrl}/api/snapshot`, {
        headers: { Authorization: `Bearer ${state.token}` },
      }),
    ]);

    loader.classList.add('hidden');

    let sessions = [];
    if (sessRes.status === 'fulfilled' && sessRes.value.ok) {
      const sessData = await sessRes.value.json();
      sessions = sessData.data || [];
    }

    let snapshot = null;
    if (snapRes.status === 'fulfilled' && snapRes.value.ok) {
      const snapData = await snapRes.value.json();
      snapshot = snapData.data || null;
    }

    if (sessions.length === 0 && (!snapshot || !snapshot.tabs || snapshot.tabs.length === 0)) {
      empty.classList.remove('hidden');
      return;
    }

    let html = '';

    // Render Live Auto-Saved Card if snapshot exists
    if (snapshot && snapshot.tabs && snapshot.tabs.length > 0) {
      html += `
        <div class="recent-session-card live-auto-card" style="border-color: rgba(56, 189, 248, 0.4); background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(168, 85, 247, 0.12));">
          <div class="recent-card-top">
            <span class="recent-session-name" style="color: #38bdf8; font-weight: 700;">
              ⚡ Live Auto-Saved Tabs
            </span>
            <span class="category-tag" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
              AUTO SYNCED
            </span>
          </div>
          <div class="recent-card-meta">
            <span>📑 ${snapshot.tabs.length} tabs open</span>
            <span>•</span>
            <span>Auto-saves without clicking save!</span>
          </div>
          <div class="recent-card-actions">
            <button id="restoreSnapshotBtn" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #0284c7, #7c3aed);">
              Restore Auto-Saved Tabs
            </button>
          </div>
        </div>
      `;
    }

    // Render regular sessions
    html += sessions
      .map(
        (session) => `
      <div class="recent-session-card" data-id="${session._id}">
        <div class="recent-card-top">
          <span class="recent-session-name" title="${escapeHtml(session.name)}">
            ${escapeHtml(session.name)}
          </span>
          <span class="category-tag">${escapeHtml(session.category || 'Others')}</span>
        </div>
        <div class="recent-card-meta">
          <span>📑 ${session.tabs ? session.tabs.length : 0} tabs</span>
          <span>•</span>
          <span>${formatDate(session.createdAt || session.updatedAt)}</span>
        </div>
        <div class="recent-card-actions">
          <button class="btn btn-primary btn-sm restore-session-btn" data-id="${session._id}">
            Restore Tabs
          </button>
        </div>
      </div>
    `
      )
      .join('');

    list.innerHTML = html;

    // Attach handler for snapshot restore button
    const restoreSnapBtn = document.getElementById('restoreSnapshotBtn');
    if (restoreSnapBtn && snapshot?.tabs) {
      restoreSnapBtn.addEventListener('click', async () => {
        restoreSnapBtn.disabled = true;
        restoreSnapBtn.textContent = 'Restoring...';
        for (const tab of snapshot.tabs) {
          if (tab.url) {
            await chrome.tabs.create({ url: tab.url, active: false });
          }
        }
        showToast(`Restored ${snapshot.tabs.length} auto-saved tabs!`, 'success');
        setTimeout(() => {
          restoreSnapBtn.disabled = false;
          restoreSnapBtn.textContent = 'Restored ✓';
        }, 1500);
      });
    }

    // Attach restore handlers for sessions
    list.querySelectorAll('.restore-session-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const sessionId = e.target.getAttribute('data-id');
        await handleRestoreSession(sessionId, e.target);
      });
    });
  } catch (err) {
    loader.classList.add('hidden');
    showToast(err.message, 'error');
  }
}

/**
 * Handle Restoring a Session (Manifest V3 chrome.tabs.create)
 */
async function handleRestoreSession(sessionId, btnElement) {
  const originalText = btnElement.textContent;
  btnElement.disabled = true;
  btnElement.textContent = 'Restoring...';

  try {
    // Call restore endpoint to update lastRestoredAt timestamp
    const res = await fetch(`${state.apiUrl}/api/sessions/${sessionId}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Restoration failed');

    const tabs = data.data?.tabs || [];
    if (tabs.length === 0) throw new Error('No tabs found in this session');

    showToast(`Restoring ${tabs.length} tabs...`, 'info');

    // Create tabs in Chrome in original order
    for (const tab of tabs) {
      if (tab.url) {
        await chrome.tabs.create({
          url: tab.url,
          active: false,
        });
      }
    }

    btnElement.textContent = 'Restored ✓';
    showToast(`Successfully opened ${tabs.length} tabs!`, 'success');

    setTimeout(() => {
      btnElement.disabled = false;
      btnElement.textContent = originalText;
    }, 2000);
  } catch (err) {
    console.error('Restore error:', err);
    showToast(err.message, 'error');
    btnElement.disabled = false;
    btnElement.textContent = originalText;
  }
}

/**
 * Handle Extension Direct Login
 */
async function handleExtensionLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('extEmailInput');
  const passwordInput = document.getElementById('extPasswordInput');
  const btn = document.getElementById('extLoginBtn');

  btn.disabled = true;
  btn.textContent = 'Connecting...';

  try {
    const res = await fetch(`${state.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    state.token = data.token;
    state.user = data.user;

    chrome.storage.local.set(
      {
        token: data.token,
        user: data.user,
      },
      () => {
        updateAuthUI();
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        emailInput.value = '';
        passwordInput.value = '';
      }
    );
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Connect Account';
  }
}

/**
 * Handle Token Handoff / Sync Token Connect
 */
async function handleTokenConnect() {
  const tokenInput = document.getElementById('syncTokenInput');
  const rawToken = tokenInput.value.trim();

  if (!rawToken) {
    return showToast('Please enter an authentication token', 'error');
  }

  try {
    // Validate token against /api/auth/me
    const res = await fetch(`${state.apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${rawToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid sync token');

    state.token = rawToken;
    state.user = data.user;

    chrome.storage.local.set(
      {
        token: rawToken,
        user: data.user,
      },
      () => {
        updateAuthUI();
        tokenInput.value = '';
        showToast('Extension connected to account!', 'success');
      }
    );
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Handle Disconnect
 */
function handleDisconnect() {
  chrome.storage.local.remove(['token', 'user'], () => {
    state.token = null;
    state.user = null;
    updateAuthUI();
    showToast('Account disconnected', 'info');
  });
}

/**
 * Toast Notification Utility
 */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  toast.classList.remove('hidden');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

// Helpers
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
