import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, ShieldAlert, Power } from 'lucide-react';

export default function EligibilityBanner({ eligibility, onToggleAvailability, isAvailable, toggling }) {
  if (!eligibility) return null;

  const { isEligible, reason, daysRemaining, nextEligibleDate } = eligibility;

  if (isEligible) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 text-emerald-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-emerald-900 flex items-center gap-2">
              Ready to Save Lives
              <span className="text-xs px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full font-semibold">
                Eligible
              </span>
            </h3>
            <p className="text-sm text-emerald-700 mt-0.5">
              You meet all medical interval (90-day cooldown) and verification criteria. Requesters in your city can find and match with you.
            </p>
          </div>
        </div>

        {onToggleAvailability && (
          <button
            onClick={onToggleAvailability}
            disabled={toggling}
            className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            {isAvailable ? 'Availability: ON' : 'Availability: OFF'}
          </button>
        )}
      </div>
    );
  }

  // If in cooldown
  if (daysRemaining > 0) {
    const formattedDate = nextEligibleDate
      ? new Date(nextEligibleDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : '';

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-amber-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
            <Clock className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-base text-amber-900 flex items-center gap-2">
              Donation Recovery Period
              <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full font-semibold">
                {daysRemaining} Day{daysRemaining === 1 ? '' : 's'} Remaining
              </span>
            </h3>
            <p className="text-sm text-amber-800 mt-0.5">
              For your health and safety, medical guidelines require a 90-day rest period between blood donations. You will be eligible again on <strong className="font-semibold underline">{formattedDate}</strong>.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-amber-700 font-medium">Next Eligible Date</div>
          <div className="text-sm font-bold text-amber-900">{formattedDate}</div>
        </div>
      </div>
    );
  }

  // If unavailable toggle is turned off
  if (!isAvailable) {
    return (
      <div className="bg-slate-100 border border-slate-300 rounded-2xl p-5 mb-6 text-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-slate-200 rounded-xl text-slate-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Availability Paused
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Your availability status is currently turned OFF. You will not receive emergency alerts or appear in search results until you toggle it back on.
            </p>
          </div>
        </div>

        {onToggleAvailability && (
          <button
            onClick={onToggleAvailability}
            disabled={toggling}
            className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-all shrink-0"
          >
            <Power className="w-4 h-4" />
            Turn ON Availability
          </button>
        )}
      </div>
    );
  }

  // Other reason (blocked / verification)
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-red-900 shadow-xs flex items-start gap-3">
      <div className="p-2.5 bg-red-100 rounded-xl text-red-600 shrink-0">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-base text-red-900">Notice on Eligibility</h3>
        <p className="text-sm text-red-700 mt-0.5">{reason}</p>
      </div>
    </div>
  );
}
