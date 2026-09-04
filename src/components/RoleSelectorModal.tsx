/**
 * Role Selection Gate / Modal
 * Lightweight role selector on landing per Section 2
 */

import React from 'react';
import { UserRole, LanguageCode } from '../types';
import { translations } from '../translations';
import { User, Building2, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

interface RoleSelectorModalProps {
  currentRole: UserRole;
  lang: LanguageCode;
  onSelectRole: (role: UserRole) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  currentRole,
  lang,
  onSelectRole,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        id="role-selector-container"
        className="bg-white text-gray-800 border border-gray-300 max-w-2xl w-full p-6 shadow-2xl relative"
      >
        {/* Top Header */}
        <div className="text-center mb-6 border-b border-gray-200 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-[#0B3D6B] border border-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-[#0B3D6B]" />
            <span>Bureau of Indian Standards | Government of India</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B3D6B] uppercase tracking-tight">
            BIS Sahayak Facilitation Portal
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Please choose your role to customize your intelligent assistant and regulatory tools:
          </p>
        </div>

        {/* Two Role Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* 1. Consumer Card */}
          <button
            id="select-consumer-role"
            onClick={() => onSelectRole('consumer')}
            className={`text-left p-5 border transition-all flex flex-col justify-between cursor-pointer ${
              currentRole === 'consumer'
                ? 'border-[#0B3D6B] bg-gray-50 shadow-xs ring-1 ring-[#0B3D6B]'
                : 'border-gray-300 hover:border-[#0B3D6B] bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-[#0B3D6B] text-white flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                {currentRole === 'consumer' && (
                  <CheckCircle2 className="w-5 h-5 text-[#0B3D6B]" />
                )}
              </div>
              <h3 className="font-bold text-base text-[#0B3D6B] uppercase tracking-tight mb-1">
                {t.roleConsumer}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.roleConsumerDesc}
              </p>
              <ul className="mt-3 text-[11px] text-gray-500 space-y-1 font-medium">
                <li>• Verify Gold Hallmark & 6-digit HUID</li>
                <li>• Check ISI mark authenticity on LPG, water, etc.</li>
                <li>• File consumer complaints on BIS CARE</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0B3D6B]">
              <span>Open Citizen Chat</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* 2. Industry / MSME Card */}
          <button
            id="select-industry-role"
            onClick={() => onSelectRole('industry')}
            className={`text-left p-5 border transition-all flex flex-col justify-between cursor-pointer ${
              currentRole === 'industry'
                ? 'border-[#0B3D6B] bg-gray-50 shadow-xs ring-1 ring-[#0B3D6B]'
                : 'border-gray-300 hover:border-[#0B3D6B] bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-[#0B3D6B] text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                {currentRole === 'industry' && (
                  <CheckCircle2 className="w-5 h-5 text-[#0B3D6B]" />
                )}
              </div>
              <h3 className="font-bold text-base text-[#0B3D6B] uppercase tracking-tight mb-1">
                {t.roleIndustry}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.roleIndustryDesc}
              </p>
              <ul className="mt-3 text-[11px] text-gray-500 space-y-1 font-medium">
                <li>• AI Standard Recommender (IS Codes & QCOs)</li>
                <li>• Scheme comparison (ISI, CRS, FMCS, Hallmarking)</li>
                <li>• License Application Tracker & NABL Labs Finder</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0B3D6B]">
              <span>Open Compliance Desk</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-gray-500 border-t border-gray-200 pt-3 flex items-center justify-between">
          <span>You can switch between Consumer and Industry modes anytime from the top bar.</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase text-[#0B3D6B] hover:underline px-2 py-1 cursor-pointer"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
