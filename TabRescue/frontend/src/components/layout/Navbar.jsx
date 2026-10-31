import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiBookmark,
  FiMenu,
  FiX,
  FiPlus,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChrome,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Navbar = ({ onToggleSidebar, onOpenCreateModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-navy-950/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <FiMenu className="text-xl" />
          </button>
        )}

        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue via-sky-500 to-brand-purple flex items-center justify-center text-white shadow-lg shadow-brand-blue/20 group-hover:shadow-brand-blue/40 transition-all duration-300">
            <FiBookmark className="text-lg" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
            Tab<span className="gradient-text">Rescue</span>
          </span>
        </Link>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {isAuthenticated ? (
          <>
            {/* Quick Extension Link */}
            <Link
              to="/settings"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-navy-900 border border-white/10 hover:border-brand-blue/40 hover:text-brand-blue transition-colors"
              title="Extension Sync & Settings"
            >
              <FiChrome className="text-sm text-brand-blue" />
              <span>Extension</span>
            </Link>

            {/* Quick Save Session Button */}
            {onOpenCreateModal && (
              <Button
                variant="primary"
                size="sm"
                icon={FiPlus}
                onClick={onOpenCreateModal}
                className="hidden sm:inline-flex shadow-sm"
              >
                New Session
              </Button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue/30 to-brand-purple/30 border border-brand-blue/40 flex items-center justify-center text-brand-blue font-bold text-xs uppercase">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                    {user?.email}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-navy-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs font-bold text-slate-200">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <FiUser className="text-sm text-slate-400" />
                        <span>Profile Details</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <FiSettings className="text-sm text-slate-400" />
                        <span>Extension & Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-white/5 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <FiLogOut className="text-sm" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
