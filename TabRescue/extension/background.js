/**
 * TabRescue Service Worker (Manifest V3)
 * Handles debounced auto-saving of browser snapshots and tab event listeners.
 */

let debounceTimer = null;
const DEBOUNCE_DELAY_MS = 1000; // 1 second fast auto-save after tab activity

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

/**
 * Filter valid restorable tabs
 */
function filterEligibleTabs(rawTabs = []) {
  const seenUrls = new Set();
  const validTabs = [];

  rawTabs.forEach((tab) => {
    const url = (tab.url || '').trim();
    if (!url) return;

    const isInternal = EXCLUDED_PREFIXES.some((prefix) =>
      url.toLowerCase().startsWith(prefix)
    );
    const isWebStore =
      url.includes('chrome.google.com/webstore') ||
      url.includes('chromewebstore.google.com');

    if (isInternal || isWebStore) return;

    const normalizedUrl = url.replace(/\/+$/, '');
    if (seenUrls.has(normalizedUrl)) return;
    seenUrls.add(normalizedUrl);

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
      url,
      favicon,
      position: tab.index,
    });
  });

  return validTabs;
}

/**
 * Capture current window tabs and send as a snapshot to backend
 */
async function captureAndSendSnapshot() {
  try {
    const storage = await chrome.storage.local.get([
      'apiUrl',
      'token',
      'autoSaveEnabled',
    ]);

    // Enabled by default unless explicitly set to false
    const isEnabled = storage.autoSaveEnabled !== false;
    if (!isEnabled || !storage.token) {
      return;
    }

    const apiUrl = storage.apiUrl || 'http://localhost:5000';
    const rawTabs = await chrome.tabs.query({ currentWindow: true });
    const eligibleTabs = filterEligibleTabs(rawTabs);

    if (eligibleTabs.length === 0) return;

    const response = await fetch(`${apiUrl}/api/snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storage.token}`,
      },
      body: JSON.stringify({
        tabs: eligibleTabs,
        windowCount: 1,
      }),
    });

    if (response.ok) {
      const now = Date.now();
      await chrome.storage.local.set({
        lastSnapshotTime: now,
        lastSnapshotTabCount: eligibleTabs.length,
      });
      console.log(`[TabRescue Auto-Save]: Snapshot & Live Session synced with ${eligibleTabs.length} tabs.`);
    }
  } catch (err) {
    console.warn('[TabRescue Auto-Save Failed]:', err.message);
  }
}

/**
 * Trigger debounced snapshot
 */
function triggerDebouncedSnapshot() {
  chrome.storage.local.get(['autoSaveEnabled'], (data) => {
    const isEnabled = data.autoSaveEnabled !== false;
    if (!isEnabled) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      captureAndSendSnapshot();
    }, DEBOUNCE_DELAY_MS);
  });
}

// Tab Event Listeners: Trigger fast auto-save on any tab action
chrome.tabs.onCreated.addListener(() => {
  triggerDebouncedSnapshot();
});

chrome.tabs.onRemoved.addListener(() => {
  triggerDebouncedSnapshot();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // Save when URL changes or page finishes loading
  if (changeInfo.url || changeInfo.status === 'complete' || changeInfo.title) {
    triggerDebouncedSnapshot();
  }
});

chrome.tabs.onActivated.addListener(() => {
  triggerDebouncedSnapshot();
});

// Extension install or update listener
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['autoSaveEnabled'], (data) => {
    if (data.autoSaveEnabled === undefined) {
      chrome.storage.local.set({ autoSaveEnabled: true });
    }
  });
  triggerDebouncedSnapshot();
});

// Runtime Message Handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_AUTOSAVE') {
    if (message.enabled) {
      triggerDebouncedSnapshot();
    } else if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    sendResponse({ success: true });
  }

  if (message.type === 'TRIGGER_MANUAL_SNAPSHOT') {
    captureAndSendSnapshot().then(() => sendResponse({ success: true }));
    return true; // async response
  }

  if (message.type === 'RESTORE_TABS') {
    const tabs = message.tabs || [];
    (async () => {
      for (const tab of tabs) {
        if (tab.url) {
          await chrome.tabs.create({ url: tab.url, active: false });
        }
      }
      sendResponse({ success: true, count: tabs.length });
    })();
    return true; // async response
  }
});

// Initial trigger on worker activation
triggerDebouncedSnapshot();

console.log('[TabRescue]: Service worker initialized.');
