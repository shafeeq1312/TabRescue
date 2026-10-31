import React, { useState } from 'react';
import {
  FiChrome,
  FiCopy,
  FiCheck,
  FiZap,
  FiDownload,
  FiShield,
  FiHelpCircle,
  FiServer,
} from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { sessionApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const SettingsPage = () => {
  const { token, user } = useAuth();
  const [tokenCopied, setTokenCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    toastSuccess('Extension Sync Token copied to clipboard!');
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const res = await sessionApi.getSessions();
      if (!res.success || !res.data) throw new Error('Could not fetch sessions');

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `TabRescue_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toastSuccess(`Exported ${res.data.length} sessions to JSON!`);
    } catch (err) {
      toastError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Settings & Integration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Connect the Google Chrome Extension, configure auto-save, and manage your account.
          </p>
        </div>

        {/* 1. Chrome Extension Integration Card */}
        <div className="rounded-2xl bg-navy-900 border border-white/10 p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center text-xl">
              <FiChrome />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Chrome Extension</h2>
              <p className="text-xs text-slate-400">
                1-click tab saving and automatic background crash protection
              </p>
            </div>
          </div>

          {/* Sync Token Card */}
          <div className="p-4 rounded-xl bg-navy-950 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Your Extension Sync Token
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Ready to Sync</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste this token in the Chrome Extension Settings tab, or simply log in with your email and password directly inside the extension popup.
            </p>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="password"
                readOnly
                value={token || ''}
                className="w-full bg-navy-900 text-slate-400 text-xs rounded-xl border border-white/10 px-3.5 py-2 font-mono outline-none"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyToken}
                icon={tokenCopied ? FiCheck : FiCopy}
                className="flex-shrink-0"
              >
                {tokenCopied ? 'Copied!' : 'Copy Token'}
              </Button>
            </div>
          </div>

          {/* Step-by-Step Installation Guide */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              How to Load the Extension in Chrome
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-navy-850/60 border border-white/5 flex flex-col gap-1">
                <span className="font-bold text-brand-blue">Step 1: Open Chrome Extensions</span>
                <span className="text-slate-400">
                  Navigate to <code className="text-slate-200 bg-black/30 px-1 py-0.5 rounded font-mono">chrome://extensions</code> in your Chrome address bar.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-850/60 border border-white/5 flex flex-col gap-1">
                <span className="font-bold text-brand-blue">Step 2: Enable Developer Mode</span>
                <span className="text-slate-400">
                  Toggle on the <strong className="text-slate-200">Developer mode</strong> switch located in the top-right corner.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-850/60 border border-white/5 flex flex-col gap-1">
                <span className="font-bold text-brand-blue">Step 3: Load Unpacked</span>
                <span className="text-slate-400">
                  Click <strong className="text-slate-200">Load unpacked</strong> and select the <code className="text-slate-200 bg-black/30 px-1 py-0.5 rounded font-mono">TabRescue/extension</code> folder from your workspace.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-850/60 border border-white/5 flex flex-col gap-1">
                <span className="font-bold text-brand-blue">Step 4: Connect & Pin</span>
                <span className="text-slate-400">
                  Click the TabRescue extension icon in your Chrome toolbar and log in or paste your sync token.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Auto-Save Snapshot Preferences */}
        <div className="rounded-2xl bg-navy-900 border border-white/10 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-xl">
              <FiZap />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Auto-Save Crash Protection</h2>
              <p className="text-xs text-slate-400">
                Understanding how automated browser tab snapshots work
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed flex flex-col gap-2.5">
            <p>
              When auto-save is enabled in your Chrome Extension, TabRescue listens to browser tab creations, closures, and navigation events.
            </p>
            <div className="p-3.5 rounded-xl bg-navy-950 border border-white/5 flex items-start gap-2.5">
              <FiShield className="text-brand-blue text-base flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-slate-400">
                <span className="font-semibold text-slate-200">Smart Debouncing & Single Document Storage</span>
                <span>
                  Updates are debounced by 4 seconds so your computer and API aren't flooded. Only one single latest snapshot is maintained for your account rather than creating a new MongoDB document on every click.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Data Export & Backup */}
        <div className="rounded-2xl bg-navy-900 border border-white/10 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xl">
              <FiDownload />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Tab Collections</h2>
              <p className="text-xs text-slate-400">
                Download a complete JSON backup of all your saved sessions and URLs
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            icon={FiDownload}
            onClick={handleExportAll}
            loading={exporting}
            className="flex-shrink-0"
          >
            Export All to JSON
          </Button>
        </div>

        {/* 4. API & Cloud Configuration */}
        <div className="rounded-2xl bg-navy-900 border border-white/10 p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-xl">
              <FiServer />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">API Endpoint Configuration</h2>
              <p className="text-xs text-slate-400">Local development and cloud deployment targets</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 border border-white/5 font-mono text-xs text-slate-300 flex items-center justify-between">
            <span>Backend Server: http://localhost:5000</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">Active</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
