import React, { useState, useEffect, useCallback } from 'react';
import {
  FiFolder,
  FiCode,
  FiBookOpen,
  FiCompass,
  FiBriefcase,
  FiFilm,
  FiUser,
  FiArrowRight,
  FiLayers,
  FiBookmark,
} from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import SessionCard from '../components/dashboard/SessionCard';
import RestoreModal from '../components/dashboard/RestoreModal';
import EditSessionModal from '../components/dashboard/EditSessionModal';
import DeleteConfirmModal from '../components/dashboard/DeleteConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { sessionApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const categoryMeta = [
  { name: 'Development', icon: FiCode, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Codebases, API docs, pull requests & repositories' },
  { name: 'Learning', icon: FiBookOpen, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', desc: 'Tutorials, educational guides, courses & papers' },
  { name: 'Research', icon: FiCompass, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', desc: 'Market analyses, architectural studies & deep dives' },
  { name: 'Work', icon: FiBriefcase, color: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20', desc: 'Projects, client tasks, roadmaps & deliverables' },
  { name: 'Entertainment', icon: FiFilm, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', desc: 'Streaming, video essays, music & gaming' },
  { name: 'Personal', icon: FiUser, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', desc: 'Travel, personal reading, hobbies & recipes' },
  { name: 'Others', icon: FiFolder, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', desc: 'Unsorted or miscellaneous browser tabs' },
];

const CategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [restoreModalSession, setRestoreModalSession] = useState(null);
  const [editModalSession, setEditModalSession] = useState(null);
  const [deleteModalSession, setDeleteModalSession] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        sessionApi.getStats(),
        sessionApi.getSessions(selectedCategory ? { category: selectedCategory } : {}),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (sessionsRes.success) setSessions(sessionsRes.data || []);
    } catch (err) {
      toastError(err.message || 'Failed to load category data');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle single delete
  const handleDeleteConfirm = async () => {
    if (!deleteModalSession) return;
    setIsDeleting(true);
    try {
      await sessionApi.deleteSession(deleteModalSession._id);
      toastSuccess(`Session "${deleteModalSession.name}" deleted.`);
      setDeleteModalSession(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to get count from stats
  const getCategoryCount = (catName) => {
    if (!stats || !stats.categoryDistribution) return 0;
    const item = stats.categoryDistribution.find((c) => c.name === catName);
    return item ? item.count : 0;
  };

  return (
    <DashboardLayout onSessionCreated={loadData}>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse and filter your tab sessions organized by workflow contexts.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryMeta.map((cat) => {
            const Icon = cat.icon;
            const count = getCategoryCount(cat.name);
            const isSelected = selectedCategory === cat.name;

            return (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 shadow-sm hover:shadow-lg ${
                  isSelected
                    ? 'bg-navy-850 border-brand-blue ring-1 ring-brand-blue'
                    : 'bg-navy-900 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl ${cat.color}`}
                  >
                    <Icon />
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {count} {count === 1 ? 'session' : 'sessions'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-white/5">
                  <span className={isSelected ? 'text-brand-blue' : 'text-slate-400'}>
                    {isSelected ? 'Viewing sessions' : 'Click to filter'}
                  </span>
                  <FiArrowRight className={`text-sm ${isSelected ? 'text-brand-blue' : 'text-slate-500'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sessions Filtered View */}
        <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{selectedCategory ? `${selectedCategory} Sessions` : 'All Categories Sessions'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                {sessions.length}
              </span>
            </h2>

            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-brand-blue hover:text-sky-300 font-semibold"
              >
                Clear Filter (Show All)
              </button>
            )}
          </div>

          {loading ? (
            <LoadingSpinner message="Filtering sessions..." />
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onRestore={(s) => setRestoreModalSession(s)}
                  onEdit={(s) => setEditModalSession(s)}
                  onDelete={(s) => setDeleteModalSession(s)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-navy-900 rounded-2xl border border-white/5">
              No sessions found in {selectedCategory || 'this category'}.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RestoreModal
        isOpen={!!restoreModalSession}
        onClose={() => setRestoreModalSession(null)}
        session={restoreModalSession}
        onRestored={loadData}
      />

      <EditSessionModal
        isOpen={!!editModalSession}
        onClose={() => setEditModalSession(null)}
        session={editModalSession}
        onUpdated={loadData}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModalSession}
        onClose={() => setDeleteModalSession(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Session?"
        message={`Are you sure you want to delete "${deleteModalSession?.name}"?`}
        loading={isDeleting}
      />
    </DashboardLayout>
  );
};

export default CategoriesPage;
