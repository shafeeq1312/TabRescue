import React, { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiTrash2,
  FiDownload,
  FiCheckSquare,
  FiSquare,
  FiBookmark,
} from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import SessionCard from '../components/dashboard/SessionCard';
import CreateSessionModal from '../components/dashboard/CreateSessionModal';
import EditSessionModal from '../components/dashboard/EditSessionModal';
import DeleteConfirmModal from '../components/dashboard/DeleteConfirmModal';
import RestoreModal from '../components/dashboard/RestoreModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { sessionApi } from '../../src/services/api';
import { useToast } from '../context/ToastContext';

const categories = [
  'All',
  'Development',
  'Learning',
  'Research',
  'Work',
  'Entertainment',
  'Personal',
  'Others',
];

const AllSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalSession, setEditModalSession] = useState(null);
  const [deleteModalSession, setDeleteModalSession] = useState(null);
  const [restoreModalSession, setRestoreModalSession] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sessionApi.getSessions({
        category: selectedCategory,
        sort: sortOrder,
        q: searchQuery,
      });

      if (res.success) {
        setSessions(res.data || []);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortOrder, searchQuery, toastError]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSessions();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [fetchSessions]);

  // Bulk selection toggles
  const handleToggleSelectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sessions.map((s) => s._id)));
    }
  };

  const handleSelectOne = (id, checked) => {
    const updated = new Set(selectedIds);
    if (checked) {
      updated.add(id);
    } else {
      updated.delete(id);
    }
    setSelectedIds(updated);
  };

  // Bulk Delete
  const handleConfirmBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await sessionApi.bulkDelete(Array.from(selectedIds));
      toastSuccess(`Deleted ${selectedIds.size} sessions.`);
      setSelectedIds(new Set());
      setBulkDeleteModalOpen(false);
      fetchSessions();
    } catch (err) {
      toastError(err.message || 'Bulk delete failed');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Single Delete
  const handleDeleteConfirm = async () => {
    if (!deleteModalSession) return;
    setIsDeleting(true);
    try {
      await sessionApi.deleteSession(deleteModalSession._id);
      toastSuccess(`Session "${deleteModalSession.name}" deleted.`);
      setDeleteModalSession(null);
      fetchSessions();
    } catch (err) {
      toastError(err.message || 'Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export all sessions as JSON
  const handleExportJSON = () => {
    if (sessions.length === 0) return toastError('No sessions to export');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TabRescue_Sessions_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toastSuccess(`Exported ${sessions.length} sessions as JSON!`);
  };

  return (
    <DashboardLayout onSessionCreated={fetchSessions}>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              All Saved Sessions
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Browse, search, filter, and bulk restore your tab collections.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={FiDownload}
              onClick={handleExportJSON}
              title="Export all sessions to JSON file"
            >
              Export JSON
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={FiPlus}
              onClick={() => setCreateModalOpen(true)}
            >
              New Session
            </Button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search by session name, website title, or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-950 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
            />
          </div>

          {/* Sort & Quick Select */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-brand-blue"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="nameAsc">Name (A-Z)</option>
                <option value="nameDesc">Name (Z-A)</option>
                <option value="lastRestored">Last Restored</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-brand-blue/20 text-brand-blue border-brand-blue/40 shadow-sm'
                  : 'bg-navy-900 text-slate-400 border-white/5 hover:text-white hover:border-white/15'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bulk Selection Actions Bar (if any selected) */}
        {sessions.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-navy-850/60 border border-white/5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 font-semibold text-slate-300 hover:text-white transition-colors"
              >
                {selectedIds.size === sessions.length && sessions.length > 0 ? (
                  <FiCheckSquare className="text-brand-blue text-sm" />
                ) : (
                  <FiSquare className="text-slate-500 text-sm" />
                )}
                <span>
                  {selectedIds.size > 0
                    ? `${selectedIds.size} of ${sessions.length} selected`
                    : 'Select All'}
                </span>
              </button>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  icon={FiTrash2}
                  onClick={() => setBulkDeleteModalOpen(true)}
                >
                  Delete Selected ({selectedIds.size})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Sessions Grid */}
        {loading ? (
          <LoadingSpinner message="Searching sessions..." />
        ) : sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                selectable={true}
                selected={selectedIds.has(session._id)}
                onSelect={handleSelectOne}
                onRestore={(s) => setRestoreModalSession(s)}
                onEdit={(s) => setEditModalSession(s)}
                onDelete={(s) => setDeleteModalSession(s)}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-2xl bg-navy-900/60 border border-white/5 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-850 border border-white/10 text-slate-400 flex items-center justify-center text-3xl mb-3">
              <FiBookmark />
            </div>
            <h3 className="text-lg font-bold text-white">No sessions matched</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try clearing your filters or changing search keywords to find your saved tabs.'
                : 'Save your first session from this dashboard or use the Chrome Extension to capture open tabs.'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSessionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchSessions}
      />

      <EditSessionModal
        isOpen={!!editModalSession}
        onClose={() => setEditModalSession(null)}
        session={editModalSession}
        onUpdated={fetchSessions}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModalSession}
        onClose={() => setDeleteModalSession(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Session?"
        message={`Are you sure you want to delete "${deleteModalSession?.name}"?`}
        loading={isDeleting}
      />

      <DeleteConfirmModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Selected Sessions?"
        message={`Are you sure you want to delete ${selectedIds.size} sessions? This cannot be undone.`}
        loading={isBulkDeleting}
      />

      <RestoreModal
        isOpen={!!restoreModalSession}
        onClose={() => setRestoreModalSession(null)}
        session={restoreModalSession}
        onRestored={fetchSessions}
      />
    </DashboardLayout>
  );
};

export default AllSessionsPage;
