/**
 * Certification Schemes Comparison & Guidance
 * Covers ISI Mark (Scheme I), CRS (Scheme II), FMCS (Foreign), and Hallmarking
 */

import React, { useState, useEffect } from 'react';
import { CertificationScheme, LanguageCode } from '../types';
import { translations } from '../translations';
import { Shield, Clock, IndianRupee, CheckSquare, FileText, ArrowRight, ExternalLink, HelpCircle } from 'lucide-react';

interface SchemesViewProps {
  lang: LanguageCode;
  highContrast: boolean;
  onAskAboutScheme: (schemeName: string) => void;
}

export const SchemesView: React.FC<SchemesViewProps> = ({
  lang,
  highContrast,
  onAskAboutScheme,
}) => {
  const t = translations[lang];
  const [schemes, setSchemes] = useState<CertificationScheme[]>([]);
  const [activeTab, setActiveTab] = useState<string>('isi-mark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/certification-schemes')
      .then(res => res.json())
      .then(data => {
        setSchemes(data.schemes || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const selectedScheme = schemes.find(s => s.id === activeTab) || schemes[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4 text-amber-600" />
          <span>Bureau of Indian Standards Conformity Assessment Schemes</span>
        </div>
        <h2 className="text-xl font-bold text-[#0B3D6B]">
          BIS Certification Schemes & Process Roadmaps
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Compare key parameters, eligibility requirements, application steps, fee schedules, and approx timelines across official BIS schemes for domestic and international manufacturers.
        </p>

        {/* Scheme Selector Tabs */}
        <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {schemes.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`px-3 py-2 text-xs font-bold rounded-xs transition-colors cursor-pointer border ${
                activeTab === s.id
                  ? 'bg-[#0B3D6B] text-white border-[#0B3D6B]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              {s.short_name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Scheme Details */}
      {selectedScheme && (
        <div className="bg-white border-2 border-slate-300 rounded-xs p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-xs font-bold">
                {selectedScheme.short_name}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0B3D6B] mt-1">
                {selectedScheme.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onAskAboutScheme(selectedScheme.name)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xs font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span>Ask AI About This Scheme</span>
              </button>
              <a
                href="https://www.manakonline.in"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#0B3D6B] hover:bg-[#082d4f] text-white rounded-xs font-semibold text-xs flex items-center gap-1.5"
              >
                <span>Apply on Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Estimated Timeline</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                {selectedScheme.approx_timeline}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Prescribed Fee Structure</span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-snug">
                {selectedScheme.fee_structure || 'As per BIS Gazetted schedule'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Eligibility Scope</span>
              </div>
              <p className="text-xs text-slate-700 leading-snug">
                {selectedScheme.eligibility}
              </p>
            </div>
          </div>

          {/* Step-by-Step Procedure */}
          <div>
            <h4 className="font-bold text-sm text-[#0B3D6B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-amber-600" />
              <span>Step-by-Step Certification Process</span>
            </h4>
            <div className="space-y-2.5">
              {selectedScheme.process_steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border-l-4 border-l-[#0B3D6B] border border-slate-200 rounded-xs text-xs sm:text-sm text-slate-800 font-medium"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Applicable Products & Document Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Products */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xs">
              <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Major Applicable Products</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedScheme.applicable_products.map((p, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-xs text-xs font-medium text-slate-800"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Checklist */}
            {selectedScheme.document_checklist && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xs">
                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mandatory Documents Checklist</span>
                </h5>
                <ul className="space-y-1 text-xs text-slate-700">
                  {selectedScheme.document_checklist.map((doc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
