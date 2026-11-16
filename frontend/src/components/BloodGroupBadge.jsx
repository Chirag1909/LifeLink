import React from 'react';
import { Droplet } from 'lucide-react';

export default function BloodGroupBadge({ group, size = 'md' }) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base font-bold px-3 py-1.5',
    xl: 'text-xl font-extrabold px-4 py-2'
  }[size] || 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-lg bg-red-600 text-white shadow-xs tracking-wider ${sizes}`}
    >
      <Droplet className="fill-current text-red-200 w-3.5 h-3.5" />
      {group || 'N/A'}
    </span>
  );
}
