import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { donorService } from '../api/donorService';
import { requestService } from '../api/requestService';
import EligibilityBanner from '../components/EligibilityBanner';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import {
  Heart,
  Droplet,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  Phone,
  Power
} from 'lucide-react';

export default function DonorDashboard() {
  const { user, refreshUser } = useAuth();

  // Tabs: 'matching' | 'my-accepted' | 'history'
  const [activeTab, setActiveTab] = useState('matching');

  // Requests state
  const [matchingRequests, setMatchingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null); // id of request being accepted/declined

  // Feedback notifications
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch all donor data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch matching open requests
      const matchingRes = await requestService.getRequests({ scope: 'compatible' });
      if (matchingRes.success) {
        setMatchingRequests(matchingRes.requests || []);
      }

      // 2. Fetch requests accepted by this donor
      const acceptedRes = await requestService.getRequests({ scope: 'my-accepted' });
      if (acceptedRes.success) {
        setAcceptedRequests(acceptedRes.requests || []);
      }

      // 3. Fetch donation history
      const historyRes = await donorService.getDonationHistory();
      if (historyRes.success) {
        setDonationHistory(historyRes.history || []);
      }
    } catch (err) {
      console.error('Failed to load donor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle availability toggle
  const handleToggleAvailability = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await donorService.toggleAvailability();
      if (res.success) {
        await refreshUser();
        setMessage({
          type: 'success',
          text: `Availability successfully changed to ${res.isAvailable ? 'Available (ON)' : 'Unavailable (OFF)'}`
        });
        fetchData();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update availability.'
      });
    } finally {
      setToggling(false);
    }
  };

  // Handle Accept request
  const handleAccept = async (requestId) => {
    setActionInProgress(requestId);
    setMessage({ type: '', text: '' });
    try {
      const res = await requestService.acceptRequest(requestId);
      if (res.success) {
        setMessage({
          type: 'success',
          text: 'Request accepted! The requester has been notified with your contact details.'
        });
        fetchData();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to accept request.'
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Decline request
  const handleDecline = async (requestId) => {
    setActionInProgress(requestId);
    try {
      const res = await requestService.declineRequest(requestId);
      if (res.success) {
        setMessage({
          type: 'info',
          text: 'Request declined. Thank you for your feedback.'
        });
        // Remove from matching list view
        setMatchingRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to decline request.'
      });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome & Quick Summary Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-red-500/20">
            {user?.bloodGroup || '🩸'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                Donor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {user?.city}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {user?.phone}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Profile Summary stats */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-center grow md:grow-0">
            <div className="text-[11px] font-semibold text-slate-500">Blood Group</div>
            <div className="text-lg font-black text-red-600">{user?.bloodGroup}</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-center grow md:grow-0">
            <div className="text-[11px] font-semibold text-slate-500">Completed Donations</div>
            <div className="text-lg font-black text-slate-900">{donationHistory.length}</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-center grow md:grow-0">
            <div className="text-[11px] font-semibold text-slate-500">Matching Needs</div>
            <div className="text-lg font-black text-blue-600">{matchingRequests.length}</div>
          </div>

          <button
            onClick={fetchData}
            title="Refresh Data"
            className="cursor-pointer p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ELIGIBILITY & COOLDOWN TRACKER BANNER */}
      <EligibilityBanner
        eligibility={user?.eligibility}
        isAvailable={user?.isAvailable}
        onToggleAvailability={handleToggleAvailability}
        toggling={toggling}
      />

      {/* Global Alerts / Messages */}
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

      {/* DASHBOARD TABS */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('matching')}
          className={`cursor-pointer pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'matching'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Compatible Emergency Requests</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold">
            {matchingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('my-accepted')}
          className={`cursor-pointer pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'my-accepted'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>My Accepted Requests</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold">
            {acceptedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`cursor-pointer pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Donation History</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold">
            {donationHistory.length}
          </span>
        </button>
      </div>

      {/* TAB 1: COMPATIBLE MATCHING REQUESTS */}
      {activeTab === 'matching' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Open Requests Compatible with {user?.bloodGroup} ({user?.city})
            </h2>
            <span className="text-xs text-slate-500">
              Showing active requests in your city that you can safely donate to
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Loading open emergency requests...</p>
            </div>
          ) : matchingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Open Emergency Requests</h3>
              <p className="text-xs text-slate-500 mt-1">
                There are no pending blood requests in {user?.city} matching your blood group right now. We will alert you when a patient needs urgent help.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {matchingRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Urgency and Blood Group */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <UrgencyBadge urgency={req.urgency} />
                          <StatusBadge status={req.status} size="sm" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {req.patientName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Needs <strong className="text-slate-800">{req.unitsNeeded} unit(s)</strong> of blood
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">
                          Patient Blood
                        </div>
                        <BloodGroupBadge group={req.bloodGroup} size="lg" />
                      </div>
                    </div>

                    {/* Details list */}
                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Building2 className="w-3.5 h-3.5" />
                          Hospital:
                        </span>
                        <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">
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
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          Needed By:
                        </span>
                        <span className="font-bold text-red-600">
                          {new Date(req.neededBy).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {req.notes && (
                        <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 italic">
                          "{req.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Accept or Decline */}
                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleAccept(req._id)}
                      disabled={!user?.eligibility?.isEligible || actionInProgress === req._id}
                      className={`cursor-pointer grow py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                        user?.eligibility?.isEligible
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {actionInProgress === req._id ? 'Accepting...' : 'Accept Request'}
                    </button>

                    <button
                      onClick={() => handleDecline(req._id)}
                      disabled={actionInProgress === req._id}
                      className="cursor-pointer py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ACCEPTED REQUESTS */}
      {activeTab === 'my-accepted' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Requests You Have Accepted
            </h2>
            <span className="text-xs text-slate-500">
              Requester has your contact details and will coordinate your hospital visit
            </span>
          </div>

          {acceptedRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Accepted Requests Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                When you accept an open emergency request, it will appear here with the requester's direct hospital contacts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {acceptedRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={req.status} size="sm" />
                        <UrgencyBadge urgency={req.urgency} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{req.patientName}</h3>
                      <p className="text-xs text-slate-500">
                        {req.hospital}, {req.city}
                      </p>
                    </div>

                    <BloodGroupBadge group={req.bloodGroup} size="md" />
                  </div>

                  {/* Requester Contact Details */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-amber-700" />
                      Requester Hospital Contact:
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-800">Contact Name:</span>
                      <span className="font-semibold">{req.requestedBy?.name || 'Requester'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-800">Phone Hotline:</span>
                      <a
                        href={`tel:${req.contactPhone}`}
                        className="font-bold text-red-600 underline font-mono text-sm"
                      >
                        {req.contactPhone}
                      </a>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 italic">
                    Once the donation is completed at the hospital, the requester will mark this as Fulfilled, and your 90-day safe cooldown will start.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DONATION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-red-600" />
                Verified Donation History
              </h2>
              <p className="text-xs text-slate-500">
                Permanent record of fulfilled blood donations completed through LifeLink.
              </p>
            </div>

            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              {donationHistory.length} Total Donation{donationHistory.length === 1 ? '' : 's'} Completed
            </div>
          </div>

          {donationHistory.length === 0 ? (
            <div className="py-12 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <History className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Donations Recorded Yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Completed donations will appear here after a requester marks their accepted request as Fulfilled.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Patient / Hospital</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Units</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donationHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {item.request?.patientName || 'Patient'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.hospital || item.request?.hospital}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {item.city || item.request?.city}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.units || 1} unit(s)
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic text-[11px]">
                        {item.notes || 'Fulfilled via LifeLink'}
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
