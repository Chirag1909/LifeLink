import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold'
  }[size] || 'px-2.5 py-1 text-xs font-semibold';

  const configs = {
    Open: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/10',
      icon: <Clock className="w-3.5 h-3.5 mr-1 inline animate-pulse text-blue-600" />,
      label: 'Open'
    },
    Accepted: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10',
      icon: <Sparkles className="w-3.5 h-3.5 mr-1 inline text-amber-600" />,
      label: 'Donor Matched & Accepted'
    },
    Fulfilled: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline text-emerald-600" />,
      label: 'Fulfilled'
    },
    Closed: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300 ring-1 ring-slate-600/10',
      icon: <XCircle className="w-3.5 h-3.5 mr-1 inline text-slate-500" />,
      label: 'Closed'
    },
    Expired: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/10',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 inline text-rose-600" />,
      label: 'Expired'
    }
  };

  const config = configs[status] || {
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: null,
    label: status || 'Unknown'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ${config.bg} ${sizeClasses}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
