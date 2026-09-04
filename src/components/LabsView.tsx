/**
 * Testing Laboratories Search & Filter Matrix
 * Filters by Product Category, State, City, and Accreditation
 */

import React, { useState, useEffect } from 'react';
import { TestingLab, LanguageCode } from '../types';
import { translations } from '../translations';
import { FlaskConical, MapPin, Phone, Mail, Search, CheckCircle, ExternalLink, Filter } from 'lucide-react';

interface LabsViewProps {
  lang: LanguageCode;
  highContrast: boolean;
}

export const LabsView: React.FC<LabsViewProps> = ({ lang, highContrast }) => {
  const t = translations[lang];
  const [labs, setLabs] = useState<TestingLab[]>([]);
  const [category, setCategory] = useState('All');
  const [state, setState] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'All',
    'Water & Food',
    'Electronics & IT',
    'Electrical & Cables',
    'Gas & Pressure',
    'Automotive & Helmets',
    'Civil & Cement',
    'Gold & Metals'
  ];

  const states = [
    'All',
    'Delhi NCR',
    'Uttar Pradesh',
    'Maharashtra',
    'Karnataka',
    'Tamil Nadu',
    'West Bengal',
    'Gujarat',
    'Odisha'
  ];

  const fetchLabs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/find-labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_category: category !== 'All' ? category : '',
          state: state !== 'All' ? state : '',
          city: ''
        })
      });
      const data = await res.json();
      setLabs(data.labs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, [category, state]);

  const filteredLabs = labs.filter(lab => {
    if (!searchKeyword) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      lab.name.toLowerCase().includes(kw) ||
      lab.city.toLowerCase().includes(kw) ||
      lab.tested_products.some(p => p.toLowerCase().includes(kw))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
          <FlaskConical className="w-4 h-4 text-amber-600" />
          <span>BIS Recognised & NABL Accredited Testing Laboratories</span>
        </div>
        <h2 className="text-xl font-bold text-[#0B3D6B]">
          Find Testing Laboratories & Testing Scope
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Locate BIS Central & Regional Laboratories (CLD), Government Testing Houses (ERTL), and private NABL-accredited test facilities approved for sample testing under BIS certification schemes.
        </p>

        {/* Filter Controls */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-xs p-2 text-xs bg-slate-50 text-slate-800 focus:ring-2 focus:ring-[#0B3D6B]"
            >
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State / Region
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-slate-300 rounded-xs p-2 text-xs bg-slate-50 text-slate-800 focus:ring-2 focus:ring-[#0B3D6B]"
            >
              {states.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Search by City or Product
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="e.g. Sahibabad, Helmet, Water..."
                className="w-full border border-slate-300 rounded-xs p-2 pl-7 text-xs bg-slate-50 text-slate-800 focus:ring-2 focus:ring-[#0B3D6B]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Laboratories Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-bold text-[#0B3D6B] uppercase tracking-wider">
            Available Laboratories ({filteredLabs.length})
          </span>
          <span>Scope: BIS Conformity Assessment Regulations 2018</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLabs.map((lab, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-slate-300 hover:border-[#0B3D6B] p-5 rounded-xs shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-xs">
                    {lab.accreditation}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {lab.city}, {lab.state}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#0B3D6B] mb-2 leading-snug">
                  {lab.name}
                </h3>

                <div className="text-xs text-slate-600 mb-3 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>{lab.address}</span>
                </div>

                {/* Scope of products */}
                <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 text-xs mb-3">
                  <div className="font-bold text-[11px] text-slate-800 mb-1">
                    Tested Products & Standards Scope:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lab.tested_products.map((tp, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-white border border-slate-300 text-slate-700 text-[11px] rounded-xs font-medium"
                      >
                        {tp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact footer */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span className="font-mono text-[11px]">
                      {typeof lab.contact === 'object' ? lab.contact.phone : lab.contact}
                    </span>
                  </span>
                  {typeof lab.contact === 'object' && lab.contact.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-[11px]">{lab.contact.email}</span>
                    </span>
                  )}
                </div>

                <a
                  href="https://www.services.bis.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-800 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                >
                  <span>Sample Dispatch Guide</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
