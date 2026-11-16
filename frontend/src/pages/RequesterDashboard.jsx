import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../api/requestService';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import BloodGroupBadge from '../components/BloodGroupBadge';
import {
  PlusCircle,
  RefreshCw,
  Building2,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Users,
  AlertCircle,
  Lock,
  Heart,
  Sparkles,
  Eye,
  Trash2
} from 'lucide-react';

export default function RequesterDashboard() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // Selected request for Matched Donors Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [matchingDonors, setMatchingDonors] = useState([]);

  // Action status loading
  const [actionInProgress, setActionInProgress] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch requester requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'All') {
        params.status = filterStatus;
      }
      const res = await requestService.getRequests(params);
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Mark status as Fulfilled or Closed
  const handleUpdateStatus = async (requestId, newStatus) => {
    setActionInProgress(requestId);
    setMessage({ type: '', text: '' });
    try {
      const res = await requestService.updateRequestStatus(requestId, newStatus);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `Request successfully marked as '${newStatus}'! ${
            newStatus === 'Fulfilled' ? 'Donation record created and donor updated.' : ''
          }`
        });
        fetchRequests();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update request status.'
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete an open request
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this open request?')) return;
    setActionInProgress(requestId);
    try {
      const res = await requestService.deleteRequest(requestId);
      if (res.success) {
        setMessage({ type: 'info', text: 'Request deleted successfully.' });
        fetchRequests();
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

  // Open Matched Donors Modal
  const handleOpenMatchedDonors = async (reqItem) => {
    setSelectedRequest(reqItem);
    setModalLoading(true);
    try {
      const res = await requestService.getRequestById(reqItem._id);
      if (res.success) {
        setMatchingDonors(res.matchingDonors || []);
      }
    } catch (err) {
      console.error('Failed to load matched donors:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Stats calculation
  const totalCount = requests.length;
  const openCount = requests.filter((r) => r.status === 'Open').length;
  const acceptedCount = requests.filter((r) => r.status === 'Accepted').length;
  const fulfilledCount = requests.filter((r) => r.status === 'Fulfilled').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and Quick Stats */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Requester Portal</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              Hospital & Patient Management
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track blood requests, view matched donors, reveal accepted donor hotlines, and confirm fulfilled transfusions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            to="/create-request"
            className="cursor-pointer grow md:grow-0 py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 hover:scale-102"
          >
            <PlusCircle className="w-4 h-4" />
            + Post Blood Request
          </Link>

          <button
            onClick={fetchRequests}
            title="Refresh"
            className="cursor-pointer p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-400">Total Requests</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/30">
          <div className="text-xs font-semibold text-blue-600">Open Requests</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{openCount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/30">
          <div className="text-xs font-semibold text-amber-600">Donor Matched</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{acceptedCount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/30">
          <div className="text-xs font-semibold text-emerald-600">Fulfilled</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{fulfilledCount}</div>
        </div>
      </div>

      {/* Feedback Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {['All', 'Open', 'Accepted', 'Fulfilled', 'Closed', 'Expired'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading your emergency requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Requests Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {filterStatus === 'All'
              ? "You haven't posted any blood requests yet. Click below to submit an emergency request."
              : `No requests with status '${filterStatus}' found.`}
          </p>
          <Link
            to="/create-request"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            Create First Request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div
              key={req._id}
              className={`bg-white rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between ${
                req.status === 'Accepted'
                  ? 'border-amber-300 ring-2 ring-amber-400/20'
                  : req.status === 'Fulfilled'
                  ? 'border-emerald-300'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header: Urgency and Blood Group */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusBadge status={req.status} size="sm" />
                      <UrgencyBadge urgency={req.urgency} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{req.patientName}</h3>
                    <p className="text-xs text-slate-500">
                      Needs <strong className="text-slate-900">{req.unitsNeeded} unit(s)</strong> of blood
                    </p>
                  </div>

                  <div className="text-right">
                    <BloodGroupBadge group={req.bloodGroup} size="lg" />
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="w-3.5 h-3.5" />
                      Hospital:
                    </span>
                    <span className="font-semibold text-slate-800 text-right max-w-[65%] truncate">
                      {req.hospital}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      City:
                    </span>
                    <span className="font-semibold text-slate-800">{req.city}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Needed By:
                    </span>
                    <span className="font-bold text-slate-800">
                      {new Date(req.neededBy).toLocaleString()}
                    </span>
                  </div>

                  {req.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 italic">
                      "{req.notes}"
                    </div>
                  )}
                </div>

                {/* ACCEPTED DONOR DETAILS SECTION (Phone Revealed!) */}
                {req.acceptedBy && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-amber-200/60">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Donor Matched & Accepted!
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-900 font-extrabold rounded-full">
                        Hotline Unlocked
                      </span>
                    </div>

                    <div className="space-y-1.5 text-amber-950">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-800">Donor Name:</span>
                        <span className="font-bold text-slate-900">{req.acceptedBy.name}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-amber-800">Blood Group:</span>
                        <span className="font-extrabold text-red-600">{req.acceptedBy.bloodGroup}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-amber-800">Direct Phone:</span>
                        <a
                          href={`tel:${req.acceptedBy.phone}`}
                          className="font-mono font-black text-red-600 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {req.acceptedBy.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                {/* For Open Requests */}
                {req.status === 'Open' && (
                  <>
                    <button
                      onClick={() => handleOpenMatchedDonors(req)}
                      className="cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition-all"
                    >
                      <Users className="w-3.5 h-3.5" />
                      View Matched Donors
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Closed')}
                        disabled={actionInProgress === req._id}
                        className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cancel Request
                      </button>

                      <button
                        onClick={() => handleDeleteRequest(req._id)}
                        disabled={actionInProgress === req._id}
                        className="cursor-pointer p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}

                {/* For Accepted Requests */}
                {req.status === 'Accepted' && (
                  <div className="flex items-center justify-between w-full gap-2">
                    <button
                      onClick={() => handleUpdateStatus(req._id, 'Fulfilled')}
                      disabled={actionInProgress === req._id}
                      className="cursor-pointer grow py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-600/20 transition-all hover:scale-101"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {actionInProgress === req._id ? 'Updating...' : 'Mark as Fulfilled'}
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(req._id, 'Closed')}
                      disabled={actionInProgress === req._id}
                      className="cursor-pointer py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}

                {/* For Fulfilled, Closed, Expired */}
                {['Fulfilled', 'Closed', 'Expired'].includes(req.status) && (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between w-full">
                    <span>Lifecycle completed: {req.status}</span>
                    <span className="font-mono text-slate-500">ID: {req._id.slice(-6)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MATCHED DONORS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Automated Engine Matching
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Matching Donors for {selectedRequest.patientName} ({selectedRequest.bloodGroup})
                </h3>
                <p className="text-xs text-slate-500">
                  Showing eligible, verified donors in {selectedRequest.city} who can safely donate to {selectedRequest.bloodGroup}.
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">Scanning active donors in {selectedRequest.city}...</p>
              </div>
            ) : matchingDonors.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Matching Donors Currently Available</h4>
                <p className="text-xs text-slate-500 mt-1">
                  All donors in {selectedRequest.city} with compatible blood groups are currently in cooldown or unavailable. LifeLink is continuing to monitor.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    Privacy Protection: Donor phone numbers are masked. Once any of these donors accepts your request on their dashboard, their phone number is automatically revealed to you.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchingDonors.map((d) => (
                    <div
                      key={d._id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{d.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {d.city}
                          </div>
                        </div>
                        <BloodGroupBadge group={d.bloodGroup} size="sm" />
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {d.phone}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Eligible
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedRequest(null)}
                className="cursor-pointer px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
