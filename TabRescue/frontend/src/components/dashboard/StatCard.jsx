import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'from-brand-blue to-cyan-500',
  iconColor = 'text-brand-blue',
  loading = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-900 border border-white/10 p-5 sm:p-6 shadow-sm hover:border-white/20 transition-all duration-300 group">
      {/* Background soft glow */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
      />

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {title}
          </span>
          {loading ? (
            <div className="h-8 w-20 bg-white/10 rounded animate-pulse my-1" />
          ) : (
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {value}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              {subtitle}
            </span>
          )}
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl bg-navy-850 border border-white/10 flex items-center justify-center text-xl ${iconColor} shadow-inner group-hover:scale-105 transition-transform`}
          >
            <Icon />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
