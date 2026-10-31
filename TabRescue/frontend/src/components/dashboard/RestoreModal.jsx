import React, { useState } from 'react';
import { FiExternalLink, FiCopy, FiCheck, FiChrome, FiGlobe } from 'react-icons/fi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { sessionApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const RestoreModal = ({ isOpen, onClose, session, onRestored }) => {
  const [copied, setCopied] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  if (!session) return null;

  const tabs = session.tabs || [];

  const handleCopyUrls = () => {
    const urls = tabs.map((t) => t.url).join('\n');
    navigator.clipboard.writeText(urls);
    setCopied(true);
    toastSuccess(`Copied ${tabs.length} URLs to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenAllTabs = async () => {
    setRestoring(true);
    try {
      // Notify backend to update lastRestoredAt timestamp
      await sessionApi.restoreSession(session._id);
      if (onRestored) onRestored(session._id);

      // Open tabs in browser
      let openedCount = 0;
      tabs.forEach((tab, index) => {
        if (tab.url) {
          // Open each URL in a new tab
          window.open(tab.url, '_blank', 'noopener,noreferrer');
          openedCount++;
        }
      });

      toastSuccess(`Restored ${openedCount} tabs in browser!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      toastError(err.message || 'Restoration failed');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Restore "${session.name}"`}
      subtitle={`Ready to restore ${tabs.length} tabs`}
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-4">
        {/* Extension Recommendation Alert */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-blue/10 via-purple-500/10 to-transparent border border-brand-blue/20 flex items-start gap-3">
          <FiChrome className="text-xl text-brand-blue flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-bold text-slate-200">
              Restoration via Chrome Extension or Web
            </span>
            <span className="text-slate-400 leading-relaxed">
              Clicking below will open all {tabs.length} tabs in your browser. (If prompted by your browser, please allow popups for localhost to open multiple tabs simultaneously).
            </span>
          </div>
        </div>

        {/* Tab list preview */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Tabs in this Session
          </span>
          <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-1">
            {tabs.map((tab, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-navy-950/70 border border-white/5 hover:border-white/15 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-5 h-5 rounded bg-navy-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <img
                      src={tab.favicon || `https://www.google.com/s2/favicons?domain=${tab.url}&sz=32`}
                      alt=""
                      className="w-3.5 h-3.5 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-200 truncate">
                      {tab.title || tab.url}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate font-mono">
                      {tab.url}
                    </span>
                  </div>
                </div>

                <a
                  href={tab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                  title="Open this tab individually"
                >
                  <FiExternalLink />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyUrls}
            icon={copied ? FiCheck : FiCopy}
          >
            {copied ? 'Copied!' : 'Copy All URLs'}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={restoring}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenAllTabs}
              loading={restoring}
              icon={FiGlobe}
            >
              Open All {tabs.length} Tabs
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RestoreModal;
