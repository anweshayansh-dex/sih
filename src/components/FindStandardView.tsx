/**
 * AI-Powered Indian Standard Identifier & Recommender
 * Product Description -> Applicable IS Standards & QCO Orders
 */

import React, { useState } from 'react';
import { LanguageCode, StandardRecommendation } from '../types';
import { translations } from '../translations';
import { Search, Sparkles, AlertCircle, CheckCircle, ExternalLink, ShieldCheck, Tag, HelpCircle } from 'lucide-react';

interface FindStandardViewProps {
  lang: LanguageCode;
  highContrast: boolean;
  onAskAboutStandard: (standardNumber: string, title: string) => void;
}

export const FindStandardView: React.FC<FindStandardViewProps> = ({
  lang,
  highContrast,
  onAskAboutStandard,
}) => {
  const t = translations[lang];
  const [productDesc, setProductDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<StandardRecommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = [
    'All',
    'Food & Beverages / Water',
    'Gas Appliances & Pressure Vessels',
    'Electronics & IT Goods',
    'Solar & Renewable Energy',
    'Automotive & Road Safety',
    'Civil Engineering & Construction',
    'Electrical & Cables',
    'Toys & Children Products',
    'Footwear & PPE',
    'Precious Metals & Hallmarking'
  ];

  const sampleQueries = [
    { label: "RO Packaged Water", text: "Commercial reverse osmosis packaged drinking water in 20L jars and 1L PET bottles with mineral enrichment" },
    { label: "LPG Gas Cylinder", text: "Welded carbon steel cylinder with safety valve for domestic liquefied petroleum gas distribution" },
    { label: "Li-Ion Power Bank", text: "Portable 20,000 mAh rechargeable lithium-ion battery power bank with USB Type-C fast charging" },
    { label: "Solar PV Panels", text: "Crystalline silicon solar photovoltaic panels for grid-tied rooftop solar power installation" },
    { label: "Two-Wheeler Helmet", text: "Protective motorcycle helmet with chin strap, EPS foam liner, and polycarbonate visor" },
    { label: "Safety Shoes", text: "Industrial leather safety shoes with 200 Joules steel toe cap and oil-resistant PU sole" }
  ];

  const handleSearch = async (queryText?: string) => {
    const text = (queryText || productDesc).trim();
    if (!text) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/recommend-standard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_description: text,
          category: selectedCategory !== 'All' ? selectedCategory : undefined
        })
      });

      const data = await res.json();
      setResults(data.recommendations || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProductDesc('');
    setSelectedCategory('All');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Intelligent IS Code Recommender (PS26107)</span>
        </div>
        <h2 className="text-xl font-bold text-[#0B3D6B]">
          {t.findStandardTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          {t.findStandardDesc}
        </p>

        {/* Input Form */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product / Material Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                placeholder={t.productDescPlaceholder}
                className="w-full border border-slate-300 rounded-xs p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D6B] bg-slate-50 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Industry Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-xs p-2.5 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-[#0B3D6B]"
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleSearch()}
                  disabled={!productDesc.trim() || isLoading}
                  className={`flex-1 py-2.5 px-3 rounded-xs font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                    !productDesc.trim() || isLoading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0B3D6B] hover:bg-[#082d4f] text-white'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Analyzing...' : t.searchBtn}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="py-2.5 px-3 rounded-xs font-semibold text-xs border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  {t.clearBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Preload Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 text-xs">
            <span className="font-semibold text-slate-500 text-[11px]">Quick Samples:</span>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProductDesc(q.text);
                  handleSearch(q.text);
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-amber-50 hover:border-amber-400 text-slate-700 border border-slate-300 rounded-xs text-[11px] font-medium transition-colors cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {isLoading && (
        <div className="p-8 text-center bg-white border border-slate-300 rounded-xs">
          <div className="inline-block w-8 h-8 border-4 border-[#0B3D6B] border-t-transparent rounded-full animate-spin mb-3"></div>
          <div className="font-bold text-sm text-[#0B3D6B]">
            Matching against BIS Standards Knowledge Base & Quality Control Orders...
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing safety specifications, testing clauses, and certification scheme applicability.
          </p>
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <div className="p-6 text-center bg-white border border-slate-300 rounded-xs">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No exact standard match found</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            Try broadening your product description or search by general category. You can also consult with the BIS Helpdesk directly.
          </p>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#0B3D6B] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Recommended Indian Standards ({results.length} Matches)</span>
            </h3>
            <span className="text-xs text-slate-500">Sorted by AI relevance confidence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-300 hover:border-[#0B3D6B] p-5 rounded-xs shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-[#0B3D6B] text-white font-mono font-bold text-xs rounded-xs">
                        {rec.standard_number}
                      </span>
                      {rec.mandatory && (
                        <span className="ml-2 inline-block px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px] rounded-xs uppercase">
                          Mandatory QCO
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {rec.confidence}% Match
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mb-2 leading-snug">
                    {rec.title}
                  </h4>

                  {rec.applicable_scheme && (
                    <div className="mb-2 text-xs flex items-center gap-1 text-slate-700">
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span className="font-semibold">Scheme:</span>
                      <span className="text-amber-900 font-medium">{rec.applicable_scheme}</span>
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 rounded-xs border border-slate-200 text-xs text-slate-700 mb-3 space-y-1.5">
                    <div>
                      <span className="font-bold text-slate-900">Why this Standard:</span>{' '}
                      {rec.reasoning}
                    </div>
                    {rec.clause_summary && (
                      <div className="text-slate-600 italic pt-1 border-t border-slate-200/80">
                        <span className="font-semibold text-slate-800 not-italic">Clause Focus:</span>{' '}
                        {rec.clause_summary}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <a
                    href="https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0B3D6B] hover:text-amber-800 font-semibold flex items-center gap-1"
                  >
                    <span>View on e-BIS Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => onAskAboutStandard(rec.standard_number, rec.title)}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-xs cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Ask AI Assistant</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
