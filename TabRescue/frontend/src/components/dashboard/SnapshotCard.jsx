import React, { useState } from 'react';
import { FiZap, FiRefreshCw, FiTrash2, FiClock } from 'react-icons/fi';
import Button from '../common/Button';
import { snapshotApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const SnapshotCard = ({ snapshot, onSnapshotCleared, onRestoreSnapshot }) => {
  const [clearing, setClearing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  if (!snapshot || !snapshot.tabs || snapshot.tabs.length === 0) {
    return null;
  }

  const handleClear = async () => {
    setClearing(true);
    try {
      await snapshotApi.deleteSnapshot();
      toastSuccess('Auto-save snapshot cleared.');
      if (onSnapshotCleared) onSnapshotCleared();
    } catch (err) {
      toastError(err.message || 'Failed to clear snapshot');
    } finally {
      setClearing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      if (onRestoreSnapshot) {
        await onRestoreSnapshot(snapshot.tabs);
      } else {
        snapshot.tabs.forEach((tab) => {
          if (tab.url) window.open(tab.url, '_blank', 'noopener,noreferrer');
        });
      }
      toastSuccess(`Restoring ${snapshot.tabs.length} tabs from auto-save snapshot!`);
    } catch (err) {
      toastError(err.message || 'Restoration error');
    } finally {
      setRestoring(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' on ' +
      d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue/10 via-purple-900/10 to-navy-900 border border-brand-blue/30 p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-brand-blue text-xl flex-shrink-0 shadow-glow-blue">
            <FiZap />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white">
                Latest Auto-Saved Browser Snapshot
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30">
                Crash Protection
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
              <span>{snapshot.tabs.length} open tabs captured</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FiClock className="text-slate-400" />
                {formatTime(snapshot.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={handleClear}
            disabled={clearing}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors text-xs flex items-center gap-1"
            title="Clear this snapshot"
          >
            <FiTrash2 className="text-sm" />
            <span className="hidden md:inline">Clear</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRestore}
            loading={restoring}
            icon={FiRefreshCw}
          >
            Restore Snapshot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SnapshotCard;
