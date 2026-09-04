/**
 * BIS Consumer Grievance Redressal & Complaint Tracker
 * Phase 7 Complaint Center
 */

import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { translations } from '../translations';
import { AlertOctagon, Search, FileText, CheckCircle2, PhoneCall, ShieldAlert, ArrowRight, Upload } from 'lucide-react';

interface ComplaintCenterViewProps {
  lang: LanguageCode;
  highContrast: boolean;
  onAskAboutComplaint: () => void;
}

export const ComplaintCenterView: React.FC<ComplaintCenterViewProps> = ({
  lang,
  highContrast,
  onAskAboutComplaint,
}) => {
  const t = translations[lang];
  const [complaintIdInput, setComplaintIdInput] = useState('BIS-CMP-2025-8842');
  const [trackedRecord, setTrackedRecord] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Complaint Form state
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formSubmitted, setFormSubmitted] = useState<any>(null);

  const sampleIds = ['BIS-CMP-2025-8842', 'BIS-CMP-2025-9120', 'BIS-CMP-2025-7731'];

  const handleTrack = async (idToTrack?: string) => {
    const cid = (idToTrack || complaintIdInput).trim();
    if (!cid) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/track-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint_id: cid })
      });
      const data = await res.json();
      if (data.found && data.complaint) {
        setTrackedRecord(data.complaint);
        setErrorMessage(null);
      } else {
        setTrackedRecord(null);
        setErrorMessage(data.message || 'Complaint ID not found.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to connect to Grievance Redressal server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) return;

    try {
      const res = await fetch('/api/submit-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumer_name: formName || 'Citizen Complainant',
          subject: formSubject,
          product_brand: formBrand
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormSubmitted(data.complaint);
        setTrackedRecord(data.complaint);
        setFormName('');
        setFormSubject('');
        setFormBrand('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    handleTrack('BIS-CMP-2025-8842');
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>BIS Citizen Grievance & Enforcement Wing</span>
        </div>
        <h2 className="text-xl font-bold text-[#0B3D6B]">
          Consumer Quality Complaints & Spurious ISI Mark Redressal
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Report sub-standard products, misleading ISI marks, un-hallmarked gold, or misuse of BIS standard marks under the provisions of the <strong>Bureau of Indian Standards Act, 2016</strong>.
        </p>

        {/* Track Existing Grievance */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Track Existing Grievance by Docket / Complaint ID:
          </label>
          <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input
              type="text"
              value={complaintIdInput}
              onChange={(e) => setComplaintIdInput(e.target.value.toUpperCase())}
              placeholder="e.g. BIS-CMP-2025-8842"
              className="flex-1 border border-slate-300 rounded-xs px-3.5 py-2 text-xs sm:text-sm font-mono uppercase bg-slate-50 text-slate-900"
            />
            <button
              onClick={() => handleTrack()}
              disabled={isLoading || !complaintIdInput.trim()}
              className="px-5 py-2 bg-[#0B3D6B] hover:bg-[#082d4f] text-white text-xs sm:text-sm font-bold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Track Grievance</span>
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px]">Sample Complaint Dockets:</span>
            {sampleIds.map((id, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setComplaintIdInput(id);
                  handleTrack(id);
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-[#0B3D6B] font-mono border border-slate-300 rounded-xs text-[11px] font-semibold cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tracked Record Card */}
      {trackedRecord && (
        <div className="bg-white border-2 border-slate-300 rounded-xs p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="font-mono text-xs font-bold bg-[#0B3D6B] text-white px-2 py-0.5 rounded-xs">
                {trackedRecord.complaint_id}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-1">
                {trackedRecord.subject}
              </h3>
              <p className="text-xs text-slate-600">
                Product / Brand: <strong className="text-slate-800">{trackedRecord.product_brand}</strong> | Filed by:{' '}
                {trackedRecord.consumer_name}
              </p>
            </div>

            <div className="text-right">
              <span
                className={`text-xs px-2.5 py-1 rounded-xs font-bold uppercase ${
                  trackedRecord.status === 'Resolved / Seized' || trackedRecord.status === 'Penalty Imposed'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                Status: {trackedRecord.status}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">Date: {trackedRecord.date_filed}</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs text-xs text-slate-800">
            <span className="font-bold text-slate-900">Enforcement Redressal Action / Notes:</span>{' '}
            {trackedRecord.resolution_notes}
          </div>
        </div>
      )}

      {/* Filing Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Procedure & Helplines */}
        <div className="bg-white border border-slate-300 rounded-xs p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#0B3D6B] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Complaint Filing Protocol</span>
          </h3>

          <ol className="space-y-2 text-xs text-slate-700 list-decimal pl-4 leading-relaxed">
            <li>
              <strong>Download BIS CARE App</strong> on Android/iOS or visit Manakonline grievance portal.
            </li>
            <li>
              Verify the 7-digit CML License Number or 6-digit HUID code printed under the ISI / Hallmark logo.
            </li>
            <li>
              Attach photographic proof of the product label, packaging batch code, and retail purchase cash memo.
            </li>
            <li>
              BIS Enforcement Officers conduct search, seizure, and sample testing at the suspect premises under section 28 of the BIS Act, 2016.
            </li>
          </ol>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xs text-xs text-blue-950 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-blue-700 shrink-0" />
            <div>
              <div className="font-bold">National Consumer Helpline (Toll-Free)</div>
              <div>Call <strong>1915</strong> or SMS to <strong>8800001915</strong></div>
            </div>
          </div>
        </div>

        {/* Right: Quick Grievance Simulation Form */}
        <div className="bg-white border border-slate-300 rounded-xs p-5 shadow-xs">
          <h3 className="font-bold text-sm text-[#0B3D6B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>File a New Quality Grievance (Simulator)</span>
          </h3>

          {formSubmitted && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>Grievance Logged!</strong> Assigned Docket ID:{' '}
                <span className="font-mono font-bold">{formSubmitted.complaint_id}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Complainant Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full border border-slate-300 rounded-xs p-2 text-xs bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Product Name / Suspect Brand
              </label>
              <input
                type="text"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                placeholder="e.g. PureAqua 20L Water Jar (No CML Number)"
                className="w-full border border-slate-300 rounded-xs p-2 text-xs bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nature of Quality Grievance / Misuse <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="Describe why you suspect quality failure or counterfeit mark..."
                className="w-full border border-slate-300 rounded-xs p-2 text-xs bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={!formSubject.trim()}
              className="w-full py-2 bg-[#0B3D6B] hover:bg-[#082d4f] text-white font-bold rounded-xs transition-colors cursor-pointer"
            >
              Submit Grievance to BIS
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
