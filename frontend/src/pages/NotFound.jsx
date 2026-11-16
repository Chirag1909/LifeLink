import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Droplet className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mt-1 mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The page you are looking for doesn't exist or has been moved to another location.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 text-white font-bold text-xs shadow-md shadow-red-600/20 hover:bg-red-700 transition-all"
        >
          <Home className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
