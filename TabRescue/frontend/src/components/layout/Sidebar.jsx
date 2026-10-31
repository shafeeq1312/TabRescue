import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiLayers,
  FiFolder,
  FiSettings,
  FiUser,
  FiChrome,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
  { name: 'All Sessions', path: '/sessions', icon: FiLayers },
  { name: 'Categories', path: '/categories', icon: FiFolder },
  { name: 'Settings', path: '/settings', icon: FiSettings },
  { name: 'Profile', path: '/profile', icon: FiUser },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const activeClass =
    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-blue/20 to-brand-purple/10 text-brand-blue border border-brand-blue/30 shadow-sm transition-all';
  const inactiveClass =
    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-900 border-r border-white/5 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-10`}
      >
        <div className="flex flex-col gap-6">
          {/* Mobile Header with close button */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-white/5">
            <span className="font-extrabold text-lg text-white">
              Tab<span className="gradient-text">Rescue</span>
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              aria-label="Close sidebar"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-3 mb-1">
              Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                >
                  <Icon className="text-lg flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Extension Promo & Logout */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
          {/* Extension Quick Promo Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-navy-850 to-navy-800 border border-white/10 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-brand-blue">
              <FiChrome className="text-base" />
              <span className="text-xs font-bold text-slate-200">Chrome Extension</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Capture & restore tabs with 1-click directly in your browser.
            </p>
            <NavLink
              to="/settings"
              onClick={() => onClose && onClose()}
              className="text-[11px] font-semibold text-brand-blue hover:text-sky-300 transition-colors inline-flex items-center gap-1"
            >
              Connect Extension &rarr;
            </NavLink>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (onClose) onClose();
              logout();
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <FiLogOut className="text-lg" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
