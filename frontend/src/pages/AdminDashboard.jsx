import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../api/adminService';
import { requestService } from '../api/requestService';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import BloodGroupBadge from '../components/BloodGroupBadge';
import {
  Users,
  ShieldCheck,
  Heart,
  Droplet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Building2,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  ShieldAlert,
  BarChart3,
  History,
  Trash2,
  Power
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Active Admin Tab: 'overview' | 'users' | 'requests'
  const [activeTab, setActiveTab] = useState('overview');

  // Users Management State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Requests Management State
  const [requests, setRequests] = useState([]);
  const [requestStatusFilter, setRequestStatusFilter] = useState('');
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Notification message
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionInProgress, setActionInProgress] = useState(null);

  // 1. Fetch System Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await adminService.getStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = {};
      if (userRoleFilter) params.role = userRoleFilter;
      if (userSearch.trim()) params.search = userSearch.trim();

      const res = await adminService.getUsers(params);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [userRoleFilter, userSearch]);

  // 3. Fetch Requests
  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const params = {};
      if (requestStatusFilter) params.status = requestStatusFilter;
      const res = await requestService.getRequests(params);
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [requestStatusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab, fetchUsers, fetchRequests]);

  // Toggle user verification
  const handleToggleVerify = async (userId, currentVerified) => {
    setActionInProgress(userId);
    try {
      const res = await adminService.verifyUser(userId, !currentVerified);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `User verification updated to: ${!currentVerified ? 'Verified' : 'Unverified'}`
        });
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update verification.'
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Toggle user block status
  const handleToggleBlock = async (userId, currentBlocked) => {
    setActionInProgress(userId);
    try {
      const res = await adminService.blockUser(userId, !currentBlocked);
      if (res.success) {
        setMessage({
          type: 'info',
          text: `User account is now: ${!currentBlocked ? 'Blocked' : 'Active / Unblocked'}`
        });
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update user block status.'
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete Request as admin
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this blood request?')) return;
    setActionInProgress(requestId);
    try {
      const res = await requestService.deleteRequest(requestId);
      if (res.success) {
        setMessage({ type: 'info', text: 'Request removed from database.' });
        fetchRequests();
        fetchStats();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete request.'
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Max value calculation for bar chart scaling
  const maxDonorsByGroup = stats?.donorsByBloodGroup
    ? Math.max(...stats.donorsByBloodGroup.map((d) => d.count), 1)
    : 1;

  const maxRequestsByStatus = stats?.requestsByStatus
    ? Math.max(...stats.requestsByStatus.map((s) => s.count), 1)
    : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">System Administration Console</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global network telemetry, user security & verification management, and system-wide request analytics.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'requests') fetchRequests();
          }}
          className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Global Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : message.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="cursor-pointer font-bold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Total Users</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats?.totalUsers || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs bg-red-50/20">
          <div className="text-[11px] font-semibold text-red-600">Registered Donors</div>
          <div className="text-xl font-black text-red-700 mt-1">{stats?.totalDonors || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-[11px] font-semibold text-emerald-600">Available Donors</div>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {stats?.availableDonors || 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <div className="text-[11px] font-semibold text-blue-600">Total Requests</div>
          <div className="text-xl font-black text-blue-700 mt-1">{stats?.totalRequests || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-300 shadow-xs bg-emerald-50/30">
          <div className="text-[11px] font-semibold text-emerald-700">Fulfilled</div>
          <div className="text-xl font-black text-emerald-800 mt-1">
            {stats?.totalFulfilled || 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs bg-purple-50/20">
          <div className="text-[11px] font-semibold text-purple-600">Donations Logged</div>
          <div className="text-xl font-black text-purple-700 mt-1">
            {stats?.totalDonations || 0}
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`cursor-pointer pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Visual Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`cursor-pointer pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold">
            {stats?.totalUsers || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`cursor-pointer pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'requests'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>All Requests</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold">
            {stats?.totalRequests || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: VISUAL CHARTS & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Donors by Blood Group */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Donors by Blood Group
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribution of active blood donors across all groups
                  </p>
                </div>
                <BloodGroupBadge group="All" size="sm" />
              </div>

              {/* Bar Chart Container */}
              <div className="space-y-3 pt-2">
                {stats?.donorsByBloodGroup?.map((item) => {
                  const percentage = Math.round((item.count / maxDonorsByGroup) * 100);
                  return (
                    <div key={item.bloodGroup} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 w-10">
                          {item.bloodGroup}
                        </span>
                        <span className="font-semibold text-slate-500">
                          {item.count} donor{item.count === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, item.count > 0 ? 8 : 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Requests by Status */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Requests by Status Lifecycle
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time status breakdown of all submitted requests
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">Total: {stats?.totalRequests}</span>
              </div>

              {/* Bar Chart Container */}
              <div className="space-y-3 pt-2">
                {stats?.requestsByStatus?.map((item) => {
                  const percentage = Math.round((item.count / maxRequestsByStatus) * 100);
                  const colorMap = {
                    Open: 'from-blue-500 to-blue-600',
                    Accepted: 'from-amber-500 to-amber-600',
                    Fulfilled: 'from-emerald-500 to-emerald-600',
                    Closed: 'from-slate-400 to-slate-500',
                    Expired: 'from-rose-500 to-rose-600'
                  };
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <StatusBadge status={item.status} size="sm" />
                        </span>
                        <span className="font-semibold text-slate-500">
                          {item.count} request{item.count === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colorMap[item.status] || 'from-slate-500 to-slate-600'} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(percentage, item.count > 0 ? 8 : 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Urgency breakdown strip */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-2">Urgency Distribution</div>
                <div className="flex gap-2">
                  {stats?.requestsByUrgency?.map((u) => (
                    <div
                      key={u.urgency}
                      className="grow p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center"
                    >
                      <div className="text-[10px] font-semibold text-slate-500">{u.urgency}</div>
                      <div className="text-base font-black text-slate-800">{u.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transfusion Activity */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Recent Completed Donations
            </h3>

            {stats?.recentDonations?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No donations completed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Donor</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Hospital / City</th>
                      <th className="py-2.5 px-3">Units</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats?.recentDonations?.map((d) => (
                      <tr key={d._id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                          {new Date(d.date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {d.donor?.name}{' '}
                          <span className="font-bold text-red-600 font-mono">
                            ({d.donor?.bloodGroup})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {d.request?.patientName || 'Emergency Patient'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {d.hospital || d.city}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{d.units || 1} unit</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, city..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
              {['', 'donor', 'requester', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    userRoleFilter === role
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {role || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          {loadingUsers ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Loading user registry...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No users found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Blood Group</th>
                    <th className="py-3 px-3">City / Phone</th>
                    <th className="py-3 px-3">Availability</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3">Account Status</th>
                    <th className="py-3 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : u.role === 'donor'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold">
                        {u.bloodGroup ? (
                          <BloodGroupBadge group={u.bloodGroup} size="sm" />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{u.city}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.phone}</div>
                      </td>

                      <td className="py-3 px-3">
                        {u.role === 'donor' ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              u.isAvailable ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            {u.isAvailable ? 'Available' : 'Paused'}
                          </span>
                        ) : (
                          <span className="text-slate-300">N/A</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {u.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isBlocked
                              ? 'bg-red-100 text-red-700 border border-red-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Verify Button */}
                          <button
                            onClick={() => handleToggleVerify(u._id, u.isVerified)}
                            disabled={actionInProgress === u._id}
                            className={`cursor-pointer px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              u.isVerified
                                ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {u.isVerified ? 'Unverify' : 'Verify'}
                          </button>

                          {/* Toggle Block Button (Disabled for Admins) */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                              disabled={actionInProgress === u._id}
                              className={`cursor-pointer px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                u.isBlocked
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              {u.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL REQUESTS MANAGEMENT */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">
              System-Wide Requests Database
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
              {['', 'Open', 'Accepted', 'Fulfilled', 'Closed', 'Expired'].map((st) => (
                <button
                  key={st}
                  onClick={() => setRequestStatusFilter(st)}
                  className={`cursor-pointer px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    requestStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st || 'All'}
                </button>
              ))}
            </div>
          </div>

          {loadingRequests ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No requests found matching your filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Blood Group</th>
                    <th className="py-3 px-3">Hospital / City</th>
                    <th className="py-3 px-3">Urgency</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Requested By</th>
                    <th className="py-3 px-3">Accepted By</th>
                    <th className="py-3 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{r.patientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {r.unitsNeeded} unit(s)
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <BloodGroupBadge group={r.bloodGroup} size="sm" />
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{r.hospital}</div>
                        <div className="text-[11px] text-slate-400">{r.city}</div>
                      </td>

                      <td className="py-3 px-3">
                        <UrgencyBadge urgency={r.urgency} />
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={r.status} size="sm" />
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{r.requestedBy?.name}</div>
                        <div className="text-[11px] text-slate-400">{r.contactPhone}</div>
                      </td>

                      <td className="py-3 px-3">
                        {r.acceptedBy ? (
                          <div>
                            <div className="font-bold text-slate-900">{r.acceptedBy.name}</div>
                            <div className="text-[11px] text-red-600 font-mono">
                              {r.acceptedBy.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">None yet</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteRequest(r._id)}
                          disabled={actionInProgress === r._id}
                          className="cursor-pointer p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
