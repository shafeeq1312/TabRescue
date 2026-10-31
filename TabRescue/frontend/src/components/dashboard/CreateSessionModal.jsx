import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiLink, FiAlertCircle, FiList, FiEdit3 } from 'react-icons/fi';
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

const CreateSessionModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Work');
  const [description, setDescription] = useState('');
  const [inputMode, setInputMode] = useState('single'); // 'single' or 'bulk'
  const [bulkText, setBulkText] = useState('');
  const [tabs, setTabs] = useState([
    { url: '', title: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleAddTabRow = () => {
    setTabs([...tabs, { url: '', title: '' }]);
  };

  const handleRemoveTabRow = (index) => {
    if (tabs.length === 1) return;
    setTabs(tabs.filter((_, i) => i !== index));
  };

  const handleTabChange = (index, field, value) => {
    const updated = [...tabs];
    updated[index][field] = value;
    setTabs(updated);
  };

  const parseBulkUrls = () => {
    const lines = bulkText.split('\n');
    const parsed = [];
    lines.forEach((line) => {
      let trimmed = line.trim();
      if (!trimmed) return;
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = 'https://' + trimmed;
      }
      try {
        const u = new URL(trimmed);
        parsed.push({
          url: trimmed,
          title: u.hostname.replace('www.', ''),
        });
      } catch (e) {
        // Skip invalid URL string
      }
    });
    return parsed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toastError('Please enter a session name');
    }

    let finalTabs = [];
    if (inputMode === 'bulk') {
      finalTabs = parseBulkUrls();
      if (finalTabs.length === 0) {
        return toastError('Please enter at least one valid URL in bulk mode');
      }
    } else {
      finalTabs = tabs
        .filter((t) => t.url && t.url.trim())
        .map((t, idx) => {
          let cleanUrl = t.url.trim();
          if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
          }
          return {
            url: cleanUrl,
            title: t.title.trim() || cleanUrl,
            position: idx,
          };
        });

      if (finalTabs.length === 0) {
        return toastError('Please provide at least one valid website URL');
      }
    }

    setLoading(true);
    try {
      const res = await sessionApi.createSession({
        name: name.trim(),
        category,
        description: description.trim(),
        tabs: finalTabs,
      });

      if (res.success) {
        toastSuccess(`Session "${name}" created with ${res.data.tabs.length} tabs!`);
        // Reset form
        setName('');
        setDescription('');
        setCategory('Work');
        setBulkText('');
        setTabs([{ url: '', title: '' }]);
        onClose();
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Browser Session"
      subtitle="Organize web links and saved tabs into a restorable session"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Session Name"
              id="createSessionName"
              placeholder="e.g. Next.js & Tailwind Research"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="createSessionCategory"
              className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Category
            </label>
            <select
              id="createSessionCategory"
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

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="createSessionDesc"
            className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Description (Optional)
          </label>
          <input
            id="createSessionDesc"
            type="text"
            placeholder="Context or notes about this session..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-navy-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-white/10 hover:border-white/20 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue px-3.5 py-2 outline-none transition-all duration-200"
          />
        </div>

        {/* Tab Input Mode Switcher */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Tabs to Include
          </span>
          <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setInputMode('single')}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                inputMode === 'single'
                  ? 'bg-brand-blue/20 text-brand-blue'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiList /> List
            </button>
            <button
              type="button"
              onClick={() => setInputMode('bulk')}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                inputMode === 'bulk'
                  ? 'bg-brand-blue/20 text-brand-blue'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiEdit3 /> Bulk Paste
            </button>
          </div>
        </div>

        {/* Input Mode 1: Individual Rows */}
        {inputMode === 'single' ? (
          <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {tabs.map((tab, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={tab.url}
                    onChange={(e) => handleTabChange(index, 'url', e.target.value)}
                    className="w-full bg-navy-950/80 text-slate-100 placeholder-slate-500 text-xs rounded-xl border border-white/10 px-3 py-2 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Page Title (optional)"
                    value={tab.title}
                    onChange={(e) => handleTabChange(index, 'title', e.target.value)}
                    className="w-full bg-navy-950/80 text-slate-100 placeholder-slate-500 text-xs rounded-xl border border-white/10 px-3 py-2 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTabRow(index)}
                  disabled={tabs.length === 1}
                  className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Remove tab row"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTabRow}
              className="text-xs text-brand-blue hover:text-sky-300 font-semibold inline-flex items-center gap-1.5 self-start mt-1"
            >
              <FiPlus /> Add Another Tab
            </button>
          </div>
        ) : (
          /* Input Mode 2: Bulk Paste */
          <div className="flex flex-col gap-1.5">
            <textarea
              rows={5}
              placeholder={`Paste multiple website URLs (one URL per line):\nhttps://react.dev\nhttps://github.com\nhttps://tailwindcss.com`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full bg-navy-950/80 text-slate-100 placeholder-slate-500 text-xs rounded-xl border border-white/10 p-3 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue font-mono custom-scrollbar"
            />
            <span className="text-[11px] text-slate-400">
              Each line will be automatically converted into a tab with extracted domain name.
            </span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Save Session
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSessionModal;
