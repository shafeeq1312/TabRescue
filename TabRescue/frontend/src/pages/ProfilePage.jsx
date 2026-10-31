import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiLock,
  FiCheck,
  FiClock,
  FiLayers,
  FiBookmark,
} from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { sessionApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [stats, setStats] = useState(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await sessionApi.getStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        // Silent catch for profile stats
      }
    };
    fetchStats();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toastError('Name cannot be empty');

    setSavingProfile(true);
    const result = await updateProfile({ name: name.trim() });
    setSavingProfile(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      return toastError('Please enter your current password');
    }
    if (newPassword.length < 6) {
      return toastError('New password must be at least 6 characters long');
    }
    if (newPassword !== confirmNewPassword) {
      return toastError('New passwords do not match');
    }

    setSavingPassword(true);
    const result = await updateProfile({
      currentPassword,
      newPassword,
    });
    setSavingPassword(false);

    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '2026';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Account & Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile information and security credentials.
          </p>
        </div>

        {/* User Overview Card */}
        <div className="rounded-2xl bg-navy-900 border border-white/10 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue/30 via-sky-600/30 to-brand-purple/30 border border-brand-blue/40 flex items-center justify-center text-brand-blue font-extrabold text-2xl uppercase shadow-glow-blue">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-white">{user?.name}</h2>
              <span className="text-xs text-slate-400 font-medium">{user?.email}</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <FiClock /> Member since {memberSince}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-navy-950 border border-white/5 text-center min-w-[100px]">
              <span className="text-xs text-slate-400">Sessions</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {stats ? stats.totalSessions : '0'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-white/5 text-center min-w-[100px]">
              <span className="text-xs text-slate-400">Rescued Tabs</span>
              <p className="text-lg font-bold text-brand-blue mt-0.5">
                {stats ? stats.totalTabs : '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form Card */}
        <div className="rounded-2xl bg-navy-900 border border-white/10 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center text-xl">
              <FiUser />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Personal Details</h3>
              <p className="text-xs text-slate-400">Update your public display name</p>
            </div>
          </div>

          <form onSubmit={handleUpdateName} className="flex flex-col gap-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                id="profileName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address (Read Only)"
                id="profileEmail"
                value={user?.email || ''}
                disabled
                helperText="Email is permanently linked to your TabRescue account"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" loading={savingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Form Card */}
        <div className="rounded-2xl bg-navy-900 border border-white/10 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-xl">
              <FiLock />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Security & Password</h3>
              <p className="text-xs text-slate-400">
                Update your account password using your current password
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 pt-2">
            <Input
              label="Current Password"
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                id="newPassword"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                id="confirmNewPassword"
                type="password"
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" size="sm" loading={savingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
