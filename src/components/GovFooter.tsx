/**
 * Authentic Indian Government Portal Footer
 * Complete with official disclaimers, RTI, external links, and accessibility info
 */

import React from 'react';
import { LanguageCode } from '../types';
import { translations } from '../translations';
import { ExternalLink, Shield, FileText, HelpCircle, Scale } from 'lucide-react';

interface GovFooterProps {
  lang: LanguageCode;
  highContrast: boolean;
}

export const GovFooter: React.FC<GovFooterProps> = ({ lang, highContrast }) => {
  const t = translations[lang];

  return (
    <footer
      id="gov-footer"
      className={`border-t text-xs transition-colors mt-auto ${
        highContrast
          ? 'bg-black border-yellow-500 text-yellow-200'
          : 'bg-gray-100 border-gray-300 text-gray-600'
      }`}
    >
      {/* Official Mandatory Disclaimer Banner */}
      <div className="bg-gray-200/70 border-b border-gray-300 py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2 text-[11px] text-gray-700">
          <Shield className="w-4 h-4 flex-shrink-0 text-[#0B3D6B] mt-0.5 sm:mt-0" />
          <p className="leading-tight text-slate-700">
            <strong>Official Notice:</strong> {t.disclaimer}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-5">
          {/* Column 1: BIS Essential Portals */}
          <div>
            <h3 className="text-[#0B3D6B] font-bold mb-2 pb-1 border-b border-gray-300 uppercase tracking-wider text-[11px]">
              BIS Online Portals
            </h3>
            <ul className="space-y-1 text-[11px] text-gray-600">
              <li>
                <a
                  href="https://www.manakonline.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0B3D6B] flex items-center gap-1"
                >
                  <span>Manakonline (e-BIS Portal)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.crsbis.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0B3D6B] flex items-center gap-1"
                >
                  <span>CRS Portal (Electronics & IT)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.services.bis.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0B3D6B] flex items-center gap-1"
                >
                  <span>Know Your Standards (e-Standard)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Government Links */}
          <div>
            <h3 className="text-[#0B3D6B] font-bold mb-2 pb-1 border-b border-gray-300 uppercase tracking-wider text-[11px]">
              Government Links
            </h3>
            <ul className="space-y-1 text-[11px] text-gray-600">
              <li>
                <a
                  href="https://www.india.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0B3D6B] flex items-center gap-1"
                >
                  <span>National Portal of India (india.gov.in)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://consumeraffairs.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0B3D6B] flex items-center gap-1"
                >
                  <span>Dept of Consumer Affairs (DOCA)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://nabl-india.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0B3D6B] flex items-center gap-1"
                >
                  <span>NABL India Accreditation</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Citizen Policies */}
          <div>
            <h3 className="text-[#0B3D6B] font-bold mb-2 pb-1 border-b border-gray-300 uppercase tracking-wider text-[11px]">
              Policy & Transparency
            </h3>
            <ul className="space-y-1 text-[11px] text-gray-600">
              <li className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-[#0B3D6B]" />
                <span>Right to Information (RTI Act 2005)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Scale className="w-3 h-3 text-[#0B3D6B]" />
                <span>BIS Act 2016 & Enforcement Rules</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3 text-[#0B3D6B]" />
                <span>Citizen's Charter & Grievance Redressal</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Helpdesk & Hackathon Details */}
          <div>
            <h3 className="text-[#0B3D6B] font-bold mb-2 pb-1 border-b border-gray-300 uppercase tracking-wider text-[11px]">
              BIS Head Office & Helpdesk
            </h3>
            <p className="text-[11px] leading-relaxed text-gray-600 mb-1.5">
              Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002.
            </p>
            <div className="bg-white p-2 border border-gray-300 text-[10px] text-gray-600">
              <div className="text-[#0B3D6B] font-bold">Smart India Hackathon (SIH)</div>
              <div>Problem Statement: <span className="font-mono font-bold text-gray-900">PS26107</span></div>
            </div>
          </div>
        </div>

        {/* Bottom Bar matching Design HTML */}
        <div className="pt-3 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-medium text-gray-500">
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-gray-800">Website Policy</span>
            <span className="cursor-pointer hover:text-gray-800">Sitemap</span>
            <span className="cursor-pointer hover:text-gray-800">Contact BIS</span>
            <span className="cursor-pointer hover:text-gray-800">Help</span>
          </div>
          <div className="text-right italic">
            {t.lastUpdated} | &copy; Bureau of Indian Standards
          </div>
        </div>
      </div>
    </footer>
  );
};
