import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiLayers,
  FiBookmark,
  FiZap,
  FiClock,
  FiPlus,
  FiSearch,
  FiArrowRight,
  FiRefreshCw,
  FiFilter,
  FiChrome,
} from 'react-icons/fi';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import SessionCard from '../components/dashboard/SessionCard';
import SnapshotCard from '../components/dashboard/SnapshotCard';
import CreateSessionModal from '../components/dashboard/CreateSessionModal';
import EditSessionModal from '../components/dashboard/EditSessionModal';
import DeleteConfirmModal from '../components/dashboard/DeleteConfirmModal';
import RestoreModal from '../components/dashboard/RestoreModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { sessionApi, snapshotApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORY_COLORS = {
  Development: '#10b981',
  Learning: '#06b6d4',
  Research: '#6366f1',
  Work: '#38bdf8',
  Entertainment: '#f43f5e',
  Personal: '#f59e0b',
  Others: '#a855f7',
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalSession, setEditModalSession] = useState(null);
  const [deleteModalSession, setDeleteModalSession] = useState(null);
  const [restoreModalSession, setRestoreModalSession] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsRes, snapshotRes, sessionsRes] = await Promise.allSettled([
        sessionApi.getStats(),
        snapshotApi.getSnapshot(),
        sessionApi.getSessions({ sort: 'newest' }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }

      if (snapshotRes.status === 'fulfilled' && snapshotRes.value?.success) {
        setSnapshot(snapshotRes.value.data);
      }

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.success) {
        setRecentSessions(sessionsRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModalSession) return;
    setIsDeleting(true);
    try {
      await sessionApi.deleteSession(deleteModalSession._id);
      toastSuccess(`Session "${deleteModalSession.name}" deleted.`);
      setDeleteModalSession(null);
      loadDashboardData();
    } catch (err) {
      toastError(err.message || 'Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered recent sessions by search
  const filteredSessions = recentSessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(q);
    const catMatch = (s.category || '').toLowerCase().includes(q);
    const tabMatch = s.tabs?.some(
      (t) => t.title?.toLowerCase().includes(q) || t.url?.toLowerCase().includes(q)
    );
    return nameMatch || catMatch || tabMatch;
  });

  // Prepare Chart Data
  const categoryData = (stats?.categoryDistribution || [])
    .filter((c) => c.count > 0)
    .map((c) => ({
      name: c.name,
      value: c.count,
      color: CATEGORY_COLORS[c.name] || '#94a3b8',
    }));

  const sessionBarData = recentSessions.slice(0, 7).map((s) => ({
    name: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
    tabs: s.tabs?.length || 0,
  }));

  return (
    <DashboardLayout onSessionCreated={loadDashboardData}>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
        {/* Top Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Monitor your saved sessions, tabs health, and auto-save snapshots.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={FiPlus}
              onClick={() => setCreateModalOpen(true)}
              className="shadow-glow-blue"
            >
              Save New Session
            </Button>
          </div>
        </div>

        {/* Extension Sync Helper Banner if 0 sessions */}
        {recentSessions.length === 0 && !loading && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-blue/15 via-purple-900/15 to-navy-900 border border-brand-blue/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center text-2xl flex-shrink-0">
                <FiChrome />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm">
                  Ready to connect the TabRescue Chrome Extension?
                </span>
                <span className="text-xs text-slate-300 mt-0.5">
                  Save all your browser tabs with 1-click directly inside Google Chrome.
                </span>
              </div>
            </div>
            <Link to="/settings" className="flex-shrink-0 self-end sm:self-center">
              <Button variant="secondary" size="sm">
                View Setup Guide &rarr;
              </Button>
            </Link>
          </div>
        )}

        {/* Auto-Saved Snapshot Banner (if available) */}
        {snapshot && snapshot.tabs && snapshot.tabs.length > 0 && (
          <SnapshotCard
            snapshot={snapshot}
            onSnapshotCleared={() => setSnapshot(null)}
            onRestoreSnapshot={() => setRestoreModalSession({ name: 'Auto-Saved Snapshot', tabs: snapshot.tabs })}
          />
        )}

        {/* Top Metrics Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            title="Total Sessions"
            value={stats ? stats.totalSessions : '0'}
            subtitle="Saved in MongoDB"
            icon={FiLayers}
            gradient="from-brand-blue to-sky-500"
            iconColor="text-brand-blue"
            loading={loading}
          />

          <StatCard
            title="Total Tabs Rescued"
            value={stats ? stats.totalTabs : '0'}
            subtitle="Indexed across sessions"
            icon={FiBookmark}
            gradient="from-purple-500 to-indigo-500"
            iconColor="text-purple-400"
            loading={loading}
          />

          <StatCard
            title="Last Restored"
            value={
              stats?.lastRestoredSession
                ? stats.lastRestoredSession.name.length > 15
                  ? stats.lastRestoredSession.name.substring(0, 15) + '...'
                  : stats.lastRestoredSession.name
                : 'None yet'
            }
            subtitle={
              stats?.lastRestoredSession
                ? `${stats.lastRestoredSession.tabCount} tabs opened`
                : 'Restore any session to activate'
            }
            icon={FiClock}
            gradient="from-emerald-500 to-teal-500"
            iconColor="text-emerald-400"
            loading={loading}
          />

          <StatCard
            title="Auto-Save Shield"
            value={snapshot ? `${snapshot.tabs?.length || 0} Tabs` : 'Ready'}
            subtitle={snapshot ? 'Snapshot in memory' : 'Extension watching'}
            icon={FiZap}
            gradient="from-amber-500 to-orange-500"
            iconColor="text-amber-400"
            loading={loading}
          />
        </div>

        {/* Charts Row: Category Distribution & Tabs per Session */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: Category Distribution (Donut Chart) */}
          <div className="rounded-2xl bg-navy-900 border border-white/10 p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Category Distribution
              </h3>
              <span className="text-xs text-slate-400">
                {categoryData.length} categories
              </span>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0b101d',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-slate-500">
                  Save sessions across categories to view distribution
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              {categoryData.map((cat) => (
                <span
                  key={cat.name}
                  className="text-[11px] font-medium flex items-center gap-1.5 text-slate-300"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name} ({cat.value})
                </span>
              ))}
            </div>
          </div>

          {/* Chart 2: Tabs Per Session Breakdown */}
          <div className="lg:col-span-2 rounded-2xl bg-navy-900 border border-white/10 p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Tabs Per Recent Session
              </h3>
              <span className="text-xs text-slate-400">Recent Sessions Activity</span>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              {sessionBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0b101d',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="tabs" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-slate-500">
                  No sessions recorded yet to chart
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
              <span>Bars indicate tab volume per session</span>
              <Link to="/sessions" className="text-brand-blue hover:text-sky-300 font-semibold">
                View All Sessions &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Header for Recent Sessions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Recent Saved Sessions</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-semibold border border-white/10">
              {filteredSessions.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search sessions or URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-navy-900 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
              />
            </div>

            <Link to="/sessions">
              <Button variant="ghost" size="sm" icon={FiArrowRight}>
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <LoadingSpinner message="Loading your dashboard..." />
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSessions.slice(0, 6).map((session) => (
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
          <div className="p-12 rounded-2xl bg-navy-900/60 border border-white/5 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-navy-850 border border-white/10 text-slate-400 flex items-center justify-center text-2xl mb-3">
              <FiBookmark />
            </div>
            <h3 className="text-base font-bold text-white">No sessions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {searchQuery
                ? `No sessions matched "${searchQuery}". Try a different keyword.`
                : 'Click "Save New Session" or use the Chrome Extension to capture your open tabs.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={FiPlus}
              onClick={() => setCreateModalOpen(true)}
              className="mt-4"
            >
              Create First Session
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSessionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadDashboardData}
      />

      <EditSessionModal
        isOpen={!!editModalSession}
        onClose={() => setEditModalSession(null)}
        session={editModalSession}
        onUpdated={loadDashboardData}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModalSession}
        onClose={() => setDeleteModalSession(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Session?"
        message={`Are you sure you want to permanently delete "${deleteModalSession?.name}"?`}
        loading={isDeleting}
      />

      <RestoreModal
        isOpen={!!restoreModalSession}
        onClose={() => setRestoreModalSession(null)}
        session={restoreModalSession}
        onRestored={loadDashboardData}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
