/**
 * Side-by-Side Standards Comparison Tool
 * Compares two Indian Standards across Technical Scope, Scheme, and Clauses
 */

import React, { useState, useEffect } from 'react';
import { StandardItem, LanguageCode } from '../types';
import { translations } from '../translations';
import { ArrowRightLeft, BookOpen, Check, ShieldCheck, Tag, ExternalLink } from 'lucide-react';

interface StandardsCompareViewProps {
  lang: LanguageCode;
  highContrast: boolean;
}

export const StandardsCompareView: React.FC<StandardsCompareViewProps> = ({
  lang,
  highContrast,
}) => {
  const t = translations[lang];
  const [standards, setStandards] = useState<StandardItem[]>([]);
  const [selectedA, setSelectedA] = useState('IS 14543:2016');
  const [selectedB, setSelectedB] = useState('IS 13428:2005');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/standards')
      .then(r => r.json())
      .then(data => {
        setStandards(data.standards || []);
        setIsLoading(false);
      })
      .catch(e => {
        console.error(e);
        setIsLoading(false);
      });
  }, []);

  const stdA = standards.find(s => s.is_code === selectedA) || standards[0];
  const stdB = standards.find(s => s.is_code === selectedB) || standards[1] || standards[0];

  const presets = [
    { label: "Packaged Drinking Water vs Mineral Water", a: "IS 14543:2016", b: "IS 13428:2005" },
    { label: "IT Equipment Safety vs Audio/Video Safety", a: "IS 13252 (Part 1):2010", b: "IS 616:2017" },
    { label: "Gold Hallmarking vs Silver Hallmarking", a: "IS 1417:2016", b: "IS 2112:2014" },
    { label: "Two-Wheeler Helmets vs Protective Gloves", a: "IS 4151:2020", b: "IS 15298 (Part 2):2016" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
          <ArrowRightLeft className="w-4 h-4 text-amber-600" />
          <span>Technical Compliance Matrix</span>
        </div>
        <h2 className="text-xl font-bold text-[#0B3D6B]">
          Compare Indian Standards (IS Codes) Side-by-Side
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Analyze technical differences, testing parameters, mandatory certification requirements, and applicable schemes across paired BIS standards.
        </p>

        {/* Preset Selectors */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">Compare Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedA(p.a);
                setSelectedB(p.b);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:border-amber-400 text-slate-700 border border-slate-300 rounded-xs text-[11px] font-semibold cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selector A */}
        <div className="bg-white p-4 border-2 border-blue-900/30 rounded-xs shadow-xs">
          <label className="block text-xs font-bold text-[#0B3D6B] mb-1 uppercase tracking-wider">
            Standard A (Primary Standard)
          </label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full border border-slate-300 rounded-xs p-2 text-xs font-semibold bg-slate-50 text-slate-900"
          >
            {standards.map((s, i) => (
              <option key={i} value={s.is_code}>
                {s.is_code} — {s.title.substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>

        {/* Selector B */}
        <div className="bg-white p-4 border-2 border-amber-900/30 rounded-xs shadow-xs">
          <label className="block text-xs font-bold text-amber-900 mb-1 uppercase tracking-wider">
            Standard B (Comparison Standard)
          </label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full border border-slate-300 rounded-xs p-2 text-xs font-semibold bg-slate-50 text-slate-900"
          >
            {standards.map((s, i) => (
              <option key={i} value={s.is_code}>
                {s.is_code} — {s.title.substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {stdA && stdB && (
        <div className="bg-white border-2 border-slate-300 rounded-xs overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#0B3D6B] text-white">
                <th className="p-3 w-1/4 font-bold uppercase tracking-wider border-r border-[#082d4f]">
                  Comparison Parameter
                </th>
                <th className="p-3 w-3/8 font-bold border-r border-[#082d4f]">
                  <span className="font-mono text-amber-300 text-sm block">{stdA.is_code}</span>
                  <span className="text-[11px] font-normal text-slate-200">{stdA.title}</span>
                </th>
                <th className="p-3 w-3/8 font-bold">
                  <span className="font-mono text-amber-300 text-sm block">{stdB.is_code}</span>
                  <span className="text-[11px] font-normal text-slate-200">{stdB.title}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {/* Row 1: Category */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Industry Sector
                </td>
                <td className="p-3 border-r border-slate-200 font-semibold">{stdA.category}</td>
                <td className="p-3 font-semibold">{stdB.category}</td>
              </tr>

              {/* Row 2: Mandatory QCO */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Mandatory QCO Order
                </td>
                <td className="p-3 border-r border-slate-200">
                  {stdA.mandatory ? (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 font-bold rounded-xs text-[11px]">
                      Mandatory Quality Control Order
                    </span>
                  ) : (
                    <span className="text-slate-500">Voluntary / Market Standard</span>
                  )}
                </td>
                <td className="p-3">
                  {stdB.mandatory ? (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 font-bold rounded-xs text-[11px]">
                      Mandatory Quality Control Order
                    </span>
                  ) : (
                    <span className="text-slate-500">Voluntary / Market Standard</span>
                  )}
                </td>
              </tr>

              {/* Row 3: Certification Scheme */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Applicable Scheme
                </td>
                <td className="p-3 border-r border-slate-200 font-medium text-[#0B3D6B]">
                  {stdA.applicable_scheme}
                </td>
                <td className="p-3 font-medium text-[#0B3D6B]">{stdB.applicable_scheme}</td>
              </tr>

              {/* Row 4: Key Clauses */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Key Technical Clauses
                </td>
                <td className="p-3 border-r border-slate-200 space-y-1">
                  {stdA.key_clauses.map((c, i) => (
                    <div key={i} className="text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                      <strong>Clause {c.clause_number}:</strong> {c.title}
                    </div>
                  ))}
                </td>
                <td className="p-3 space-y-1">
                  {stdB.key_clauses.map((c, i) => (
                    <div key={i} className="text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                      <strong>Clause {c.clause_number}:</strong> {c.title}
                    </div>
                  ))}
                </td>
              </tr>

              {/* Row 5: Testing Parameters */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Testing Requirements
                </td>
                <td className="p-3 border-r border-slate-200">
                  <div className="flex flex-wrap gap-1">
                    {stdA.testing_parameters.map((tp, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 text-[10px] rounded-xs font-mono">
                        {tp}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {stdB.testing_parameters.map((tp, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 text-[10px] rounded-xs font-mono">
                        {tp}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
