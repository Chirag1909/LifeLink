import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../api/requestService';
import {
  PlusCircle,
  Building2,
  MapPin,
  Clock,
  Phone,
  Flame,
  User,
  Droplet,
  AlertCircle,
  ArrowLeft,
  HeartHandshake
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMPATIBLE_DONORS_MAP = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export default function CreateRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tomorrow as default neededBy
  const getDefaultNeededBy = () => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d.toISOString().slice(0, 16); // format: YYYY-MM-DDTHH:mm
  };

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState(user?.city || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [urgency, setUrgency] = useState('Urgent');
  const [neededBy, setNeededBy] = useState(getDefaultNeededBy());
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const compatibleDonors = COMPATIBLE_DONORS_MAP[bloodGroup] || [bloodGroup];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!patientName.trim()) {
      setError('Please provide patient name.');
      return;
    }
    if (!hospital.trim()) {
      setError('Please provide hospital name and address.');
      return;
    }
    if (!city.trim()) {
      setError('Please specify city.');
      return;
    }
    if (new Date(neededBy) <= new Date()) {
      setError('Needed-by date must be in the future.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        patientName: patientName.trim(),
        bloodGroup,
        unitsNeeded: Number(unitsNeeded),
        hospital: hospital.trim(),
        city: city.trim(),
        contactPhone: contactPhone.trim(),
        urgency,
        neededBy: new Date(neededBy).toISOString(),
        notes: notes.trim()
      };

      const res = await requestService.createRequest(payload);
      if (res.success) {
        navigate('/requester');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        to="/requester"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requester Portal
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Emergency Transfusion Broadcast
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Create Emergency Blood Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fill in the medical details below. Compatible donors in your city will immediately see this on their dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Name & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Patient Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g., Emily Watson"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Required Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-black text-red-600 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compatibility Engine Live Hint */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Compatibility Matching:</span> A patient needing{' '}
              <strong>{bloodGroup}</strong> can receive blood from donors with{' '}
              <span className="font-extrabold text-blue-700">
                {compatibleDonors.join(', ')}
              </span>
              . The system will match eligible donors from all these compatible groups.
            </div>
          </div>

          {/* Units Needed & Urgency Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Units of Blood Needed (Pints / Bags) *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Urgency Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Critical', 'Urgent', 'Normal'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`cursor-pointer py-2 rounded-xl text-xs font-bold transition-all text-center border ${
                      urgency === lvl
                        ? lvl === 'Critical'
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : lvl === 'Urgent'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hospital & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Hospital Name & Ward Address *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g., Mount Sinai Hospital, Trauma ICU 3B"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                City *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., New York"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Phone & Needed-By Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Emergency Contact Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 555-0100"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Donors will see this phone number to reach you directly once they accept.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Needed-By Deadline (Date & Time) *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="datetime-local"
                  required
                  value={neededBy}
                  onChange={(e) => setNeededBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                If unfulfilled past this date, status automatically transitions to Expired.
              </span>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Medical Notes / Instructions (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Emergency bypass surgery scheduled for 9am tomorrow. Please report to 4th Floor Blood Bank Reception."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/requester"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-2 hover:scale-102"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Broadcast Emergency Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
