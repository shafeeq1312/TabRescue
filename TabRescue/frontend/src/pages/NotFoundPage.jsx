import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiBookmark } from 'react-icons/fi';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white text-3xl shadow-glow-blue mb-6">
        <FiBookmark />
      </div>

      <span className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-sky-400 to-brand-purple tracking-tighter">
        404
      </span>

      <h1 className="text-2xl font-bold text-white mt-4">
        Browser Session Not Found
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
        The tab or page you're trying to reach does not exist or has been moved to a different URL.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" icon={FiArrowLeft}>
            Return to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" size="md">
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
