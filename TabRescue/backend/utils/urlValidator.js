import validator from 'validator';

/**
 * Filter out internal/ineligible browser URLs
 */
export const isRestorableUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // Exclude internal browser schemes
  const excludedPrefixes = [
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

  for (const prefix of excludedPrefixes) {
    if (trimmed.toLowerCase().startsWith(prefix)) {
      return false;
    }
  }

  // Exclude Chrome Web Store pages which block script execution/tabs manipulation
  if (trimmed.includes('chrome.google.com/webstore') || trimmed.includes('chromewebstore.google.com')) {
    return false;
  }

  // Must be valid URL with http or https protocol
  return validator.isURL(trimmed, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
};

/**
 * Clean and normalize a list of tabs, removing invalid URLs and duplicates
 * Returns { validTabs, duplicateCount, removedCount }
 */
export const sanitizeAndDeduplicateTabs = (tabs = []) => {
  if (!Array.isArray(tabs)) return { validTabs: [], duplicateCount: 0, removedCount: 0 };

  const seenUrls = new Set();
  const validTabs = [];
  let duplicateCount = 0;
  let removedCount = 0;

  tabs.forEach((tab, index) => {
    const rawUrl = tab.url ? tab.url.trim() : '';

    if (!isRestorableUrl(rawUrl)) {
      removedCount++;
      return;
    }

    // Normalize URL: remove trailing slash for comparison
    const normalizedUrl = rawUrl.replace(/\/+$/, '');

    if (seenUrls.has(normalizedUrl)) {
      duplicateCount++;
      return;
    }

    seenUrls.add(normalizedUrl);

    // Extract hostname for fallback favicon
    let favicon = tab.favicon || '';
    if (!favicon) {
      try {
        const parsed = new URL(rawUrl);
        favicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
      } catch (e) {
        favicon = '';
      }
    }

    validTabs.push({
      title: (tab.title || 'Untitled Page').trim(),
      url: rawUrl,
      favicon,
      position: typeof tab.position === 'number' ? tab.position : index,
    });
  });

  return {
    validTabs,
    duplicateCount,
    removedCount,
  };
};
