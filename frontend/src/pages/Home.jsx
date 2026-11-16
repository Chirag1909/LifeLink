import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Droplet,
  MapPin,
  ShieldCheck,
  Heart,
  Clock,
  AlertCircle,
  Phone,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
  Lock
} from 'lucide-react';
import { donorService } from '../api/donorService';
import { requestService } from '../api/requestService';
import { useAuth } from '../context/AuthContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import CompatibilityMatrix from '../components/CompatibilityMatrix';

const BLOOD_GROUPS = ['All Groups', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  // Search filter states
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All Groups');
  const [cityInput, setCityInput] = useState('');
  const [matchMode, setMatchMode] = useState('compatible'); // 'compatible' or 'exact'
  
  // Results & Loading states
  const [donors, setDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Live Emergency Requests Feed
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Search donors
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoadingDonors(true);
    setHasSearched(true);
    try {
      const params = {};
      if (selectedBloodGroup !== 'All Groups') {
        params.bloodGroup = selectedBloodGroup;
        params.matchMode = matchMode;
      }
      if (cityInput.trim()) {
        params.city = cityInput.trim();
      }

      const res = await donorService.searchDonors(params);
      if (res.success) {
        setDonors(res.donors || []);
      }
    } catch (err) {
      console.error('Failed to search donors:', err);
    } finally {
      setLoadingDonors(false);
    }
  };

  // Initial load: get open emergency requests & initial donors
  useEffect(() => {
    handleSearch();

    const fetchLiveRequests = async () => {
      setLoadingRequests(true);
      try {
        // Fetch open requests using donor search endpoint or public requests
        // If logged in, use requestService.getRequests, otherwise fetch public donors
      } catch (err) {
        console.error('Error fetching requests:', err);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchLiveRequests();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION WITH SEARCH ENGINE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-600 via-rose-600 to-red-700 text-white pt-16 pb-24 md:pt-20 md:pb-28">
        {/* Background glow & accents */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider mb-6 text-red-50">
            <Heart className="w-4 h-4 fill-white text-white" />
            Every Drop Connects A Life
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            Find Verified Blood Donors <br className="hidden sm:inline" />
            <span className="text-red-200">In Real-Time For Emergencies</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-red-100 max-w-2xl mx-auto font-normal">
            LifeLink bridges emergency patients with verified, available donors in seconds. Safe 90-day interval tracking, smart blood compatibility matching, and instant emergency alerts.
          </p>

          {/* QUICK SEARCH BOX */}
          <div className="mt-10 max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-800">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Blood Group Select */}
              <div className="sm:col-span-4 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Required Blood Group
                </label>
                <div className="relative">
                  <select
                    value={selectedBloodGroup}
                    onChange={(e) => setSelectedBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City Input */}
              <div className="sm:col-span-5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Hospital City / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="e.g., New York, Boston, Chicago"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-3">
                <label className="hidden sm:block text-xs font-bold text-transparent mb-1">
                  Action
                </label>
                <button
                  type="submit"
                  disabled={loadingDonors}
                  className="cursor-pointer w-full py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 hover:scale-102"
                >
                  <Search className="w-4 h-4" />
                  {loadingDonors ? 'Searching...' : 'Find Donors'}
                </button>
              </div>
            </form>

            {/* Compatibility toggle & privacy notice */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Match Mode:</span>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="matchMode"
                    value="compatible"
                    checked={matchMode === 'compatible'}
                    onChange={() => setMatchMode('compatible')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>All Compatible Groups (e.g. O- universal)</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer ml-2">
                  <input
                    type="radio"
                    name="matchMode"
                    value="exact"
                    checked={matchMode === 'exact'}
                    onChange={() => setMatchMode('exact')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Exact Group Only</span>
                </label>
              </div>

              <div className="flex items-center gap-1 text-slate-600">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Donor phone numbers are protected until donor accepts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH RESULTS CONTAINER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                Eligible Donors Available
                <span className="text-xs px-2.5 py-1 bg-red-100 text-red-700 font-extrabold rounded-full">
                  {donors.length} Verified
                </span>
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Only showing active donors who passed the 90-day medical interval safety check and admin verification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={isAuthenticated ? (user?.role === 'requester' ? '/create-request' : '/donor') : '/register'}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold transition-all"
              >
                <Droplet className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                {isAuthenticated ? 'Post Emergency Need' : 'Register As Donor'}
              </Link>
            </div>
          </div>

          {loadingDonors ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-semibold text-slate-500">Scanning matching donors across cities...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Eligible Donors Found</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                No active donors currently match your chosen criteria in this city. Try choosing "All Groups" or broadening your city search.
              </p>
              <button
                onClick={() => {
                  setSelectedBloodGroup('All Groups');
                  setCityInput('');
                  handleSearch();
                }}
                className="cursor-pointer px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {donors.map((donor) => (
                <div
                  key={donor._id}
                  className="rounded-2xl border border-slate-200/90 p-5 bg-gradient-to-b from-white to-slate-50/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base leading-snug">
                          {donor.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{donor.city}</span>
                        </div>
                      </div>

                      <BloodGroupBadge group={donor.bloodGroup} size="md" />
                    </div>

                    <div className="space-y-1.5 my-3 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Available & Eligible
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Phone Contact:</span>
                        <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          {donor.phone}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">90-Day Cooldown:</span>
                        <span className="text-slate-700 font-medium">
                          {donor.lastDonationDate
                            ? `Last donated ${new Date(donor.lastDonationDate).toLocaleDateString()}`
                            : 'First-time / Ready'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {donor.bloodGroup === 'O-' ? '★ Universal Donor' : 'Compatible Donor'}
                    </span>
                    <Link
                      to={isAuthenticated ? '/create-request' : '/login'}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                    >
                      Request Blood →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BLOOD COMPATIBILITY MATRIX SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CompatibilityMatrix />
      </section>

      {/* HOW LIFELINK WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Safe & Transparent Workflow
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">
            How LifeLink Protects Donors & Patients
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every step is automated to safeguard medical intervals, preserve donor privacy, and ensure urgent needs are fulfilled without delay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center relative">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-lg">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Post Emergency Need</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Requester submits required blood group, hospital, units needed, urgency, and needed-by deadline.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center relative">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-lg">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Automated Match</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Engine identifies eligible donors in the same city who meet compatibility rules and the 90-day rest rule.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center relative">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-lg">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Donor Accepts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Donor reviews the request and clicks Accept. Only then is the donor's contact phone number securely unlocked to the requester.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center relative">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-lg">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Fulfilled & Reset</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Requester marks the request Fulfilled. A donation record is created and donor's next eligible date resets (+90 days).
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready To Save A Life In Your City?
            </h3>
            <p className="text-slate-300 text-sm mt-2">
              Registration takes less than 60 seconds. Choose whether to register as a donor, or post an emergency request for a hospital patient.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/register?role=donor"
              className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/30 transition-all hover:scale-102"
            >
              Register as Donor
            </Link>
            <Link
              to="/register?role=requester"
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold transition-all hover:scale-102"
            >
              Need Blood? Sign Up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
