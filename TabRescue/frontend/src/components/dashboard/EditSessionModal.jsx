import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { sessionApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const categories = [
  'Development',
  'Learning',
  'Research',
  'Work',
  'Entertainment',
  'Personal',
  'Others',
];

const EditSessionModal = ({ isOpen, onClose, session, onUpdated }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Others');
  const [description, setDescription] = useState('');
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (session) {
      setName(session.name || '');
      setCategory(session.category || 'Others');
      setDescription(session.description || '');
      setTabs(
        session.tabs && session.tabs.length > 0
          ? session.tabs.map((t) => ({ url: t.url, title: t.title, favicon: t.favicon }))
          : [{ url: '', title: '' }]
      );
    }
  }, [session]);

  const handleTabChange = (index, field, value) => {
    const updated = [...tabs];
    updated[index][field] = value;
    setTabs(updated);
  };

  const handleAddTab = () => {
    setTabs([...tabs, { url: '', title: '' }]);
  };

  const handleRemoveTab = (index) => {
    if (tabs.length === 1) return;
    setTabs(tabs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toastError('Please enter a session name');
    }

    const validTabs = tabs
      .filter((t) => t.url && t.url.trim())
      .map((t, idx) => ({
        url: t.url.trim(),
        title: t.title ? t.title.trim() : t.url.trim(),
        favicon: t.favicon || '',
        position: idx,
      }));

    if (validTabs.length === 0) {
      return toastError('A session must contain at least one valid URL');
    }

    setLoading(true);
    try {
      const res = await sessionApi.updateSession(session._id, {
        name: name.trim(),
        category,
        description: description.trim(),
        tabs: validTabs,
      });

      if (res.success) {
        toastSuccess('Session updated successfully!');
        onClose();
        if (onUpdated) onUpdated(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to update session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Browser Session"
      subtitle="Modify session details, category, or tab links"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Session Name"
              id="editSessionName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="editSessionCategory"
              className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Category
            </label>
            <select
              id="editSessionCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-navy-900/90 text-slate-100 text-sm rounded-xl border border-white/10 hover:border-white/20 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue px-3.5 py-2.5 outline-none transition-all duration-200"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-navy-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="editSessionDesc"
            className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Description
          </label>
          <input
            id="editSessionDesc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-navy-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-white/10 hover:border-white/20 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue px-3.5 py-2 outline-none transition-all duration-200"
          />
        </div>

        {/* Tab List */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Tabs ({tabs.length})
          </span>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {tabs.map((tab, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="URL (https://...)"
                    value={tab.url}
                    onChange={(e) => handleTabChange(index, 'url', e.target.value)}
                    className="w-full bg-navy-950/80 text-slate-100 text-xs rounded-xl border border-white/10 px-3 py-2 outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Title"
                    value={tab.title}
                    onChange={(e) => handleTabChange(index, 'title', e.target.value)}
                    className="w-full bg-navy-950/80 text-slate-100 text-xs rounded-xl border border-white/10 px-3 py-2 outline-none focus:border-brand-blue"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTab(index)}
                  disabled={tabs.length === 1}
                  className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTab}
              className="text-xs text-brand-blue hover:text-sky-300 font-semibold inline-flex items-center gap-1.5 self-start mt-1"
            >
              <FiPlus /> Add Tab
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSessionModal;
