import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Droplet,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  History,
  Search,
  User,
  Power
} from 'lucide-react';
import { donorService } from '../api/donorService';

export default function Navbar() {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleToggleAvailability = async () => {
    if (!user || user.role !== 'donor' || toggling) return;
    try {
      setToggling(true);
      await donorService.toggleAvailability();
      await refreshUser();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setToggling(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                Life<span className="text-red-600">Link</span>
              </span>
              <span className="block text-[10px] -mt-1 font-semibold tracking-wider uppercase text-slate-600">
                Blood & Emergency Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Find Donors
            </Link>

            {isAuthenticated && user?.role === 'donor' && (
              <>
                <Link
                  to="/donor"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/donor')
                      ? 'bg-red-50 text-red-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 inline mr-1.5 text-red-600" />
                  Donor Dashboard
                </Link>
                <Link
                  to="/donor#history"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <History className="w-4 h-4 inline mr-1.5" />
                  Donation History
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'requester' && (
              <>
                <Link
                  to="/requester"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/requester')
                      ? 'bg-red-50 text-red-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 inline mr-1.5 text-red-600" />
                  My Requests
                </Link>
                <Link
                  to="/create-request"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/create-request')
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Blood Request
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-red-50 text-red-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 inline mr-1.5 text-red-600" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* User Controls / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Donor Quick Availability Toggle */}
                {user.role === 'donor' && (
                  <button
                    onClick={handleToggleAvailability}
                    disabled={toggling}
                    title="Click to toggle availability"
                    className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      user.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Power className={`w-3.5 h-3.5 ${user.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {user.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                )}

                {/* Profile Pill */}
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500 capitalize">
                      <span className="font-medium">{user.role}</span>
                      {user.bloodGroup && (
                        <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-extrabold text-[10px]">
                          {user.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="cursor-pointer p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs shadow-red-500/20 transition-all hover:scale-102"
                >
                  Join as Donor / Requester
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && user?.role === 'donor' && (
              <button
                onClick={handleToggleAvailability}
                disabled={toggling}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  user.isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}
              >
                {user.isAvailable ? 'Avail' : 'Unavail'}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-slate-800 hover:bg-slate-100"
          >
            Find Donors & Requests
          </Link>

          {isAuthenticated ? (
            <>
              {user.role === 'donor' && (
                <Link
                  to="/donor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-slate-800 hover:bg-slate-100"
                >
                  Donor Dashboard & Requests
                </Link>
              )}
              {user.role === 'requester' && (
                <>
                  <Link
                    to="/requester"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium text-slate-800 hover:bg-slate-100"
                  >
                    My Blood Requests
                  </Link>
                  <Link
                    to="/create-request"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-semibold bg-red-600 text-white text-center"
                  >
                    + Post Emergency Request
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-slate-800 hover:bg-slate-100"
                >
                  Admin Console
                </Link>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{user.role} ({user.city})</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-semibold text-slate-700 bg-slate-100"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-semibold bg-red-600 text-white"
              >
                Join as Donor / Requester
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
