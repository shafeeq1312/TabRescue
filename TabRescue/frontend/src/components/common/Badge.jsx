import React from 'react';
import {
  FiCode,
  FiBookOpen,
  FiCompass,
  FiBriefcase,
  FiFilm,
  FiUser,
  FiFolder,
} from 'react-icons/fi';

const categoryConfigs = {
  Development: {
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: FiCode,
  },
  Learning: {
    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    icon: FiBookOpen,
  },
  Research: {
    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    icon: FiCompass,
  },
  Work: {
    color: 'bg-brand-blue/15 text-brand-blue border-brand-blue/30',
    icon: FiBriefcase,
  },
  Entertainment: {
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: FiFilm,
  },
  Personal: {
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: FiUser,
  },
  Others: {
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: FiFolder,
  },
};

const Badge = ({ category = 'Others', showIcon = true, size = 'sm', className = '' }) => {
  const config = categoryConfigs[category] || categoryConfigs.Others;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.color} ${
        sizeClasses[size] || sizeClasses.sm
      } ${className}`}
    >
      {showIcon && <Icon className="flex-shrink-0" />}
      <span>{category}</span>
    </span>
  );
};

export default Badge;
