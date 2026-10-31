import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookmark,
  FiZap,
  FiShield,
  FiRefreshCw,
  FiLayers,
  FiArrowRight,
  FiChrome,
  FiCheckCircle,
  FiCpu,
  FiDatabase,
} from 'react-icons/fi';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col text-slate-100 overflow-x-hidden">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-navy-950/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white shadow-lg shadow-brand-blue/30">
            <FiBookmark className="text-lg" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Tab<span className="gradient-text">Rescue</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" size="sm" icon={FiArrowRight}>
                Open Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Soft background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-brand-purple/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-blue mb-6 backdrop-blur-md">
          <FiChrome className="text-sm" />
          <span>Powered by Chrome Extension Manifest V3 & MERN</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight sm:leading-tight">
          Never Lose Your Browser <br className="hidden sm:inline" />
          <span className="gradient-text">Sessions Again.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          Accidental window close? Laptop restart? Chrome crash? TabRescue captures all your open tabs, organizes them into smart categories, and restores them in their original order with a single click.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link to={isAuthenticated ? '/dashboard' : '/register'} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" icon={FiZap} className="w-full shadow-glow-blue">
              Start Rescuing Tabs — Free
            </Button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">
              See How It Works
            </Button>
          </a>
        </div>

        {/* Realistic Dashboard Preview Visual */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl bg-gradient-to-b from-white/10 to-transparent p-1 shadow-2xl backdrop-blur-xl">
          <div className="rounded-2xl bg-navy-900 border border-white/10 overflow-hidden shadow-2xl text-left">
            {/* Window bar */}
            <div className="bg-navy-950 px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">TabRescue Dashboard — Production</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-semibold">MongoDB Atlas Connected</span>
              </div>
            </div>

            {/* Mock Dashboard UI Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-navy-900/90">
              {/* Stat 1 */}
              <div className="p-4 rounded-xl bg-navy-850 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase">Saved Sessions</span>
                  <p className="text-2xl font-bold text-white mt-1">28</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center text-lg">
                  <FiLayers />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-4 rounded-xl bg-navy-850 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase">Rescued Tabs</span>
                  <p className="text-2xl font-bold text-white mt-1">194</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center text-lg">
                  <FiBookmark />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-4 rounded-xl bg-navy-850 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase">Auto-Save Status</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">Active Protection</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-lg">
                  <FiZap />
                </div>
              </div>

              {/* Sample Session Preview Row */}
              <div className="md:col-span-3 p-4 rounded-xl bg-navy-850/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Development
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Full-Stack MERN Architecture & Docs</h4>
                    <p className="text-xs text-slate-400">GitHub • React Docs • MongoDB Manual • Stack Overflow • 5 tabs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-blueDeep hover:bg-blue-600 text-white shadow-sm flex items-center gap-1.5">
                    <FiRefreshCw className="text-xs" /> Restore 5 Tabs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-white">
            Built for Developers, Researchers & Power Users
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Every feature is engineered to protect your workflow and eliminate browser tab clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 hover:border-brand-blue/40 transition-all flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center text-xl">
              <FiZap />
            </div>
            <h3 className="text-lg font-bold text-white">Instant 1-Click Capture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the Chrome Extension to capture all active tabs from your current window, auto-filtering internal chrome:// pages and eliminating duplicates.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-xl">
              <FiRefreshCw />
            </div>
            <h3 className="text-lg font-bold text-white">Debounced Auto-Save Snapshots</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optional background snapshotting watches your tabs with smart debouncing. If your laptop shuts down unexpectedly, your tabs are waiting to be restored.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xl">
              <FiShield />
            </div>
            <h3 className="text-lg font-bold text-white">Zero Credential Exposure</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              TabRescue stores only tab URLs and metadata — never page content, cookies, tokens, or login credentials. Your browsing privacy remains 100% secure.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
            Simple 3-Step Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            How TabRescue Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-navy-900/60 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-brand-blue/20 text-brand-blue font-extrabold flex items-center justify-center text-lg mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-white mb-2">Connect Extension</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Load the lightweight Chrome Extension in Developer Mode and link it to your TabRescue account in one click.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-navy-900/60 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center text-lg mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-white mb-2">Save Current Session</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click "Save Current Session". All open tabs are categorized and persisted securely into your cloud MongoDB database.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-navy-900/60 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-lg mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-white mb-2">Restore Any Time</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reopen TabRescue from any browser or directly through the extension popup and restore all tabs in their exact order.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Engineered with Modern Standards
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Tech Stack Architecture</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
          <div className="p-4 rounded-xl bg-navy-900 border border-white/5 flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-brand-blue">React.js + Vite</span>
            <span className="text-[10px] text-slate-400">Fast SPA Frontend</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-900 border border-white/5 flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-sky-400">Tailwind CSS</span>
            <span className="text-[10px] text-slate-400">Design System</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-900 border border-white/5 flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-emerald-400">Node + Express</span>
            <span className="text-[10px] text-slate-400">REST API Server</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-900 border border-white/5 flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-emerald-300">MongoDB + Mongoose</span>
            <span className="text-[10px] text-slate-400">Document Database</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-900 border border-white/5 flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-purple-400">JWT + bcrypt</span>
            <span className="text-[10px] text-slate-400">Secure Auth</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-900 border border-white/5 flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-amber-400">Manifest V3</span>
            <span className="text-[10px] text-slate-400">Chrome Extension</span>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto my-8 rounded-3xl bg-gradient-to-r from-brand-blue/20 via-purple-900/20 to-navy-900 border border-brand-blue/30 text-center flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-white">
          Ready to protect your browsing sessions?
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mt-3 leading-relaxed">
          Create your free account today, load the Chrome Extension, and never search for lost tabs again.
        </p>
        <Link to={isAuthenticated ? '/dashboard' : '/register'} className="mt-6">
          <Button variant="primary" size="lg" icon={FiZap} className="shadow-glow-blue">
            Create Free Account Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
