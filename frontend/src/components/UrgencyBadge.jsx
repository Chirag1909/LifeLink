import React from 'react';
import { AlertCircle, Flame, Info } from 'lucide-react';

export default function UrgencyBadge({ urgency, showIcon = true }) {
  switch (urgency) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-xs">
          {showIcon && <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" />}
          Critical Need
        </span>
      );
    case 'Urgent':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
          Urgent
        </span>
      );
    case 'Normal':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          {showIcon && <Info className="w-3.5 h-3.5 text-emerald-600" />}
          Normal
        </span>
      );
  }
}
