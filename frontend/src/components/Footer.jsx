import React from 'react';
import { Droplet, Heart, Shield, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Life<span className="text-red-500">Link</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              A rapid Blood Donor Finder and Emergency Request Management System connecting verified donors with patients in urgent need. Built with strict 90-day donation safety rules and privacy protections.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Verified & Secure
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                Non-Profit Initiative
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Find Blood Donors
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register as a Donor
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link to="/create-request" className="hover:text-white transition-colors">
                  Post Emergency Request
                </Link>
              </li>
            </ul>
          </div>

          {/* College Project Tech Stack */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Tech Stack & Details
            </h4>
            <div className="text-xs space-y-1.5 text-slate-400">
              <p><strong className="text-slate-200">Front-End:</strong> React (Vite) + Tailwind CSS</p>
              <p><strong className="text-slate-200">Back-End:</strong> Node.js + Express (REST API)</p>
              <p><strong className="text-slate-200">Database:</strong> MongoDB + Mongoose</p>
              <p><strong className="text-slate-200">Auth:</strong> JWT & bcrypt Password Hashing</p>
              <div className="pt-2 text-[11px] text-slate-500">
                Evaluation: Front-End, Back-End, Integration & Report
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LifeLink Emergency Network. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Every drop matters • Saving lives together
          </p>
        </div>
      </div>
    </footer>
  );
}
