import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiClock,
  FiDownload,
  FiAlertTriangle,
  FiRefreshCw,
  FiGlobe,
} from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EditSessionModal from '../components/dashboard/EditSessionModal';
import DeleteConfirmModal from '../components/dashboard/DeleteConfirmModal';
import RestoreModal from '../components/dashboard/RestoreModal';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { sessionApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const SessionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [addTabModalOpen, setAddTabModalOpen] = useState(false);
  const [newTabUrl, setNewTabUrl] = useState('');
  const [newTabTitle, setNewTabTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingTab, setIsAddingTab] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchSessionDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sessionApi.getSessionById(id);
      if (res.success && res.data) {
        setSession(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Session not found');
      navigate('/sessions');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toastError]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  // Copy all URLs
  const handleCopyAll = () => {
    if (!session?.tabs?.length) return;
    const urls = session.tabs.map((t) => t.url).join('\n');
    navigator.clipboard.writeText(urls);
    setCopiedAll(true);
    toastSuccess(`Copied ${session.tabs.length} URLs!`);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Copy single URL
  const handleCopySingle = (url, index) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    toastSuccess('URL copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // Delete single tab
  const handleDeleteTab = async (index) => {
    if (session.tabs.length <= 1) {
      return toastError('A session must keep at least one tab. Delete the entire session instead.');
    }
    const updatedTabs = session.tabs.filter((_, i) => i !== index);
    try {
      const res = await sessionApi.updateSession(session._id, {
        tabs: updatedTabs,
      });
      if (res.success) {
        setSession(res.data);
        toastSuccess('Tab removed from session.');
      }
    } catch (err) {
      toastError(err.message || 'Failed to remove tab');
    }
  };

  // Add new tab to this session
  const handleAddTabSubmit = async (e) => {
    e.preventDefault();
    if (!newTabUrl.trim()) return;

    let cleanUrl = newTabUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const newTab = {
      url: cleanUrl,
      title: newTabTitle.trim() || cleanUrl,
      position: session.tabs.length,
    };

    setIsAddingTab(true);
    try {
      const res = await sessionApi.updateSession(session._id, {
        tabs: [...session.tabs, newTab],
      });
      if (res.success) {
        setSession(res.data);
        toastSuccess('Tab added to session!');
        setNewTabUrl('');
        setNewTabTitle('');
        setAddTabModalOpen(false);
      }
    } catch (err) {
      toastError(err.message || 'Failed to add tab');
    } finally {
      setIsAddingTab(false);
    }
  };

  // Delete session confirm
  const handleDeleteSession = async () => {
    setIsDeleting(true);
    try {
      await sessionApi.deleteSession(session._id);
      toastSuccess('Session deleted successfully.');
      navigate('/sessions');
    } catch (err) {
      toastError(err.message || 'Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export single session as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${session.name.replace(/[^a-z0-9]/gi, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toastSuccess('Session exported as JSON!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen={false} message="Loading session details..." />
      </DashboardLayout>
    );
  }

  if (!session) return null;

  // Duplicate URL Detection within this session
  const seenUrls = new Set();
  const duplicateUrls = new Set();
  (session.tabs || []).forEach((t) => {
    const norm = (t.url || '').replace(/\/+$/, '');
    if (seenUrls.has(norm)) {
      duplicateUrls.add(norm);
    } else {
      seenUrls.add(norm);
    }
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        {/* Back link */}
        <div>
          <Link
            to="/sessions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <FiArrowLeft /> Back to All Sessions
          </Link>
        </div>

        {/* Session Header Card */}
        <div className="rounded-2xl bg-navy-900 border border-white/10 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge category={session.category} size="sm" />
                <span className="text-xs text-slate-400">
                  {session.tabs?.length || 0} Tabs
                </span>
                {duplicateUrls.size > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <FiAlertTriangle /> {duplicateUrls.size} Duplicate URL
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {session.name}
              </h1>

              {session.description && (
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {session.description}
                </p>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
              <Button
                variant="primary"
                size="md"
                icon={FiGlobe}
                onClick={() => setRestoreModalOpen(true)}
                className="shadow-glow-blue"
              >
                Restore Session
              </Button>
            </div>
          </div>

          {/* Metadata & Secondary Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <FiClock className="text-slate-500" />
                Created {new Date(session.createdAt).toLocaleDateString()}
              </span>
              {session.lastRestoredAt && (
                <span className="text-emerald-400">
                  Last restored {new Date(session.lastRestoredAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1 text-xs"
                title="Copy all URLs in session"
              >
                {copiedAll ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                <span>{copiedAll ? 'Copied' : 'Copy URLs'}</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1 text-xs"
                title="Export session JSON"
              >
                <FiDownload />
                <span>Export</span>
              </button>

              <button
                onClick={() => setEditModalOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1 text-xs"
                title="Edit session details"
              >
                <FiEdit2 />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-xs"
                title="Delete session"
              >
                <FiTrash2 />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab List Section */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Saved Tabs</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
              {session.tabs?.length || 0}
            </span>
          </h2>

          <Button
            variant="secondary"
            size="sm"
            icon={FiPlus}
            onClick={() => setAddTabModalOpen(true)}
          >
            Add Tab
          </Button>
        </div>

        {/* Individual Tabs Table / Cards */}
        <div className="flex flex-col gap-2.5">
          {session.tabs && session.tabs.length > 0 ? (
            session.tabs.map((tab, index) => {
              const isDuplicate = duplicateUrls.has((tab.url || '').replace(/\/+$/, ''));
              return (
                <div
                  key={tab._id || index}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-navy-900 border transition-all duration-200 group ${
                    isDuplicate ? 'border-amber-500/30 bg-amber-950/10' : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-navy-950 border border-white/10 flex items-center justify-center p-1.5 flex-shrink-0">
                      <img
                        src={tab.favicon || `https://www.google.com/s2/favicons?domain=${tab.url}&sz=32`}
                        alt=""
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100 truncate">
                          {tab.title || 'Untitled Tab'}
                        </span>
                        {isDuplicate && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                            Duplicate
                          </span>
                        )}
                      </div>
                      <a
                        href={tab.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-blue/80 hover:text-brand-blue truncate font-mono mt-0.5"
                      >
                        {tab.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleCopySingle(tab.url, index)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Copy URL"
                    >
                      {copiedIndex === index ? (
                        <FiCheck className="text-emerald-400 text-sm" />
                      ) : (
                        <FiCopy className="text-sm" />
                      )}
                    </button>

                    <a
                      href={tab.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-white/5 transition-colors"
                      title="Open website in new tab"
                    >
                      <FiExternalLink className="text-sm" />
                    </a>

                    <button
                      onClick={() => handleDeleteTab(index)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove tab from session"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 bg-navy-900 rounded-xl border border-white/5">
              No tabs present in this session.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditSessionModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        session={session}
        onUpdated={(updated) => setSession(updated)}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSession}
        title="Delete This Session?"
        message={`Are you sure you want to delete "${session.name}"? This cannot be undone.`}
        loading={isDeleting}
      />

      <RestoreModal
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        session={session}
        onRestored={fetchSessionDetails}
      />

      {/* Add Tab Modal */}
      <Modal
        isOpen={addTabModalOpen}
        onClose={() => setAddTabModalOpen(false)}
        title="Add Tab to Session"
        subtitle={`Adding tab to "${session.name}"`}
      >
        <form onSubmit={handleAddTabSubmit} className="flex flex-col gap-4">
          <Input
            label="Website URL"
            id="newTabUrlInput"
            placeholder="https://example.com"
            value={newTabUrl}
            onChange={(e) => setNewTabUrl(e.target.value)}
            required
          />

          <Input
            label="Tab Title (Optional)"
            id="newTabTitleInput"
            placeholder="e.g. Documentation"
            value={newTabTitle}
            onChange={(e) => setNewTabTitle(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="ghost" onClick={() => setAddTabModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isAddingTab}>
              Add Tab
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default SessionDetailsPage;
