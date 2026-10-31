import React from 'react';
import { FiBookmark, FiGithub, FiHeart } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="w-full bg-navy-950 border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white text-xs">
            <FiBookmark />
          </div>
          <span className="font-bold text-sm text-slate-300">
            Tab<span className="text-brand-blue">Rescue</span>
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">•</span>
          <span className="text-slate-400 text-xs hidden sm:inline">
            Smart Browser Session Recovery Platform
          </span>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-navy-900 border border-white/5">React + Vite</span>
          <span className="px-2 py-0.5 rounded-md bg-navy-900 border border-white/5">Node.js + Mongo</span>
          <span className="px-2 py-0.5 rounded-md bg-navy-900 border border-white/5">Manifest V3</span>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} TabRescue. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
