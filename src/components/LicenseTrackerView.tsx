/**
 * BIS License Status Tracker & Stepper
 * Section 7 requirement: Wired to real database records, not static HTML
 */

import React, { useState } from 'react';
import { LicenseStatus, LanguageCode } from '../types';
import { translations } from '../translations';
import { Search, CheckCircle2, Clock, AlertTriangle, Building, FileCheck, MapPin, Calendar, HelpCircle, ShieldCheck } from 'lucide-react';

interface LicenseTrackerViewProps {
  lang: LanguageCode;
  highContrast: boolean;
  onAskAboutLicense: (licenseNum: string, product: string) => void;
}

export const LicenseTrackerView: React.FC<LicenseTrackerViewProps> = ({
  lang,
  highContrast,
  onAskAboutLicense,
}) => {
  const t = translations[lang];
  const [licenseInput, setLicenseInput] = useState('CM/L-8472910');
  const [record, setRecord] = useState<LicenseStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleLicenses = [
    { num: 'CM/L-8472910', title: 'Packaged Drinking Water (Approved)' },
    { num: 'CM/L-9182345', title: 'LPG Cylinders (In Testing)' },
    { num: 'R-41002381', title: 'Li-Ion Power Bank (CRS Registered)' }
  ];

  const handleTrack = async (numToTrack?: string) => {
    const num = (numToTrack || licenseInput).trim();
    if (!num) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/track-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_number: num })
      });

      const data = await res.json();
      if (data.found && data.record) {
        setRecord(data.record);
        setErrorMessage(null);
      } else {
        setRecord(null);
        setErrorMessage(data.message || 'No license record found for this number.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to connect to license tracking service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load on first render
  React.useEffect(() => {
    handleTrack('CM/L-8472910');
  }, []);

  const stages = ['Application Submission', 'Factory Audit & Inspection', 'Sample Testing in CLD', 'Grant of CML License'];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
          <FileCheck className="w-4 h-4 text-amber-600" />
          <span>BIS Manakonline Central License Registry</span>
        </div>
        <h2 className="text-xl font-bold text-[#0B3D6B]">
          Track BIS Certification License & Application Status
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Verify active CML licenses, factory surveillance stages, laboratory sample testing status, and grant dates in real-time.
        </p>

        {/* Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value)}
              placeholder="Enter License No. (e.g. CM/L-8472910 or R-41002381)"
              className="w-full border border-slate-300 rounded-xs px-3.5 py-2 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0B3D6B] bg-slate-50 text-slate-900"
            />
          </div>
          <button
            onClick={() => handleTrack()}
            disabled={isLoading || !licenseInput.trim()}
            className="px-5 py-2 bg-[#0B3D6B] hover:bg-[#082d4f] text-white text-xs sm:text-sm font-bold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Tracking...' : 'Track Status'}</span>
          </button>
        </div>

        {/* Sample Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold">Demo License IDs:</span>
          {sampleLicenses.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLicenseInput(s.num);
                handleTrack(s.num);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-amber-100 text-[#0B3D6B] font-mono border border-slate-300 rounded-xs text-[11px] font-semibold cursor-pointer"
            >
              {s.num} ({s.title.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xs text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">License Record Lookup Notice</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Live Record Details */}
      {record && (
        <div className="bg-white border-2 border-slate-300 rounded-xs p-6 shadow-xs space-y-6">
          {/* Top Record Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-bold bg-[#0B3D6B] text-white px-2.5 py-0.5 rounded-xs">
                  {record.license_number}
                </span>
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Stage: {record.current_stage}</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                {record.company_name}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Product: <span className="text-slate-900 font-semibold">{record.product_name}</span> | Standard:{' '}
                <span className="font-mono text-[#0B3D6B] font-bold">{record.standard_number}</span>
              </p>
            </div>

            <div className="text-right">
              <button
                onClick={() => onAskAboutLicense(record.license_number, record.product_name)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs rounded-xs flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Ask AI About This License</span>
              </button>
              {record.valid_till && (
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-end gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Valid Till: <strong className="text-slate-700">{record.valid_till}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Metadata info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span><strong>Factory Address:</strong> {record.factory_location}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Application Date: <strong className="text-slate-800">{record.applied_date}</strong>
            </div>
          </div>

          {/* Stepper Visualization */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B3D6B] mb-4">
              Licensing Progress Stepper
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {record.stage_history.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isInProgress = step.status === 'in_progress';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 border rounded-xs relative ${
                      isCompleted
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : isInProgress
                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300/40'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 bg-white rounded border border-slate-200">
                        Step {idx + 1}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isInProgress ? (
                        <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300"></div>
                      )}
                    </div>

                    <div className="font-bold text-xs text-slate-900 mb-1">
                      {step.stage}
                    </div>

                    <div className="text-[11px] text-slate-600 leading-snug">
                      {step.remarks}
                    </div>

                    <div className="mt-2 text-[10px] font-mono text-slate-500">
                      Date: {step.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
