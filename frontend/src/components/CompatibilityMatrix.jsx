import React, { useState } from 'react';
import { ShieldCheck, HeartHandshake, Check, X } from 'lucide-react';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const COMPATIBILITY = {
  'O-': { canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
  'O+': { canGiveTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
  'A-': { canGiveTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
  'A+': { canGiveTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
  'B-': { canGiveTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
  'B+': { canGiveTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
  'AB-': { canGiveTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
  'AB+': { canGiveTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
};

export default function CompatibilityMatrix() {
  const [selectedGroup, setSelectedGroup] = useState('O-');

  const selectedInfo = COMPATIBILITY[selectedGroup];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            Medical Reference
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            Interactive Blood Compatibility Chart
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Explore red blood cell compatibility rules implemented directly in the LifeLink matching engine.
          </p>
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-1.5">
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedGroup === bg
                  ? 'bg-red-600 text-white shadow-xs scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Highlights for selected blood group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>Donor {selectedGroup} Can Donate To:</span>
            {selectedGroup === 'O-' && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                Universal Donor!
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedInfo.canGiveTo.map((target) => (
              <span
                key={target}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-300 shadow-2xs"
              >
                {target}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Recipient {selectedGroup} Can Receive From:</span>
            {selectedGroup === 'AB+' && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-200 text-blue-900 rounded-full">
                Universal Recipient!
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedInfo.canReceiveFrom.map((target) => (
              <span
                key={target}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-blue-800 border border-blue-300 shadow-2xs"
              >
                {target}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold">
              <th className="p-2.5 text-left rounded-l-xl">Donor \ Patient</th>
              {BLOOD_GROUPS.map((recipient) => (
                <th key={recipient} className="p-2.5 font-bold">
                  {recipient}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {BLOOD_GROUPS.map((donor) => {
              const isSelected = donor === selectedGroup;
              return (
                <tr
                  key={donor}
                  className={`transition-colors ${
                    isSelected ? 'bg-red-50/50 font-semibold' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="p-2.5 text-left font-bold text-slate-800 flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSelected ? 'bg-red-600' : 'bg-slate-300'
                      }`}
                    />
                    {donor}
                  </td>
                  {BLOOD_GROUPS.map((recipient) => {
                    const compatible = COMPATIBILITY[donor].canGiveTo.includes(recipient);
                    return (
                      <td key={recipient} className="p-2.5">
                        {compatible ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-300">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
