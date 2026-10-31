import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiExternalLink,
  FiTrash2,
  FiEdit2,
  FiCopy,
  FiCheck,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';

const SessionCard = ({
  session,
  onRestore,
  onEdit,
  onDelete,
  selected = false,
  onSelect,
  selectable = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { success: toastSuccess } = useToast();

  const tabs = session.tabs || [];
  const previewTabs = tabs.slice(0, 5);
  const extraTabsCount = tabs.length > 5 ? tabs.length - 5 : 0;

  const handleCopyUrls = (e) => {
    e.stopPropagation();
    const urls = tabs.map((t) => t.url).join('\n');
    navigator.clipboard.writeText(urls);
    setCopied(true);
    toastSuccess(`Copied ${tabs.length} URLs to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestoreClick = async (e) => {
    e.stopPropagation();
    setIsRestoring(true);
    try {
      if (onRestore) {
        await onRestore(session);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div
      className={`relative rounded-2xl bg-navy-900 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 group ${
        selected
          ? 'border-brand-blue ring-1 ring-brand-blue bg-navy-850'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Top Banner & Category */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            {selectable && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect && onSelect(session._id, e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-navy-950 text-brand-blue focus:ring-brand-blue focus:ring-offset-navy-900 cursor-pointer"
                aria-label={`Select session ${session.name}`}
              />
            )}
            <Badge category={session.category} size="xs" />
            {session.isAutoSaved && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                Auto-Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
              {tabs.length} {tabs.length === 1 ? 'tab' : 'tabs'}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/sessions/${session._id}`}
          className="block group-hover:text-brand-blue transition-colors"
        >
          <h3 className="font-bold text-base text-slate-100 line-clamp-1 leading-snug">
            {session.name}
          </h3>
        </Link>

        {/* Description */}
        {session.description ? (
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
            {session.description}
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic mt-1 min-h-[32px] flex items-center">
            No description provided
          </p>
        )}

        {/* Favicons Strip */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5 overflow-x-hidden">
          {previewTabs.map((tab, idx) => (
            <div
              key={idx}
              title={tab.title || tab.url}
              className="w-7 h-7 rounded-lg bg-navy-950 border border-white/10 flex items-center justify-center p-1 flex-shrink-0"
            >
              <img
                src={tab.favicon || `https://www.google.com/s2/favicons?domain=${tab.url}&sz=32`}
                alt=""
                className="w-4 h-4 object-contain rounded-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))}

          {extraTabsCount > 0 && (
            <div className="w-7 h-7 rounded-lg bg-navy-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300 flex-shrink-0">
              +{extraTabsCount}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="p-4 bg-navy-850/60 border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <FiClock className="text-xs text-slate-500" />
            {formatDate(session.createdAt)}
          </span>
          {session.lastRestoredAt && (
            <span className="text-[10px] text-emerald-400 mt-0.5">
              Restored {formatRelativeTime(session.lastRestoredAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Copy URLs button */}
          <button
            onClick={handleCopyUrls}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Copy all URLs"
            aria-label="Copy URLs"
          >
            {copied ? <FiCheck className="text-emerald-400 text-sm" /> : <FiCopy className="text-sm" />}
          </button>

          {/* Edit button */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(session);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Edit session"
              aria-label="Edit session"
            >
              <FiEdit2 className="text-sm" />
            </button>
          )}

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete session"
              aria-label="Delete session"
            >
              <FiTrash2 className="text-sm" />
            </button>
          )}

          {/* Restore Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleRestoreClick}
            loading={isRestoring}
            icon={FiRefreshCw}
            className="ml-1"
          >
            Restore
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
