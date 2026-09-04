/**
 * Official Indian Government Header for BIS Sahayak
 * Conforms to NIC / BIS.gov.in portal guidelines
 */

import React from 'react';
import { UserRole, LanguageCode } from '../types';
import { translations } from '../translations';
import { PhoneCall, ShieldCheck, ArrowRightLeft, Building2, User, Menu, Download, FolderArchive, Globe } from 'lucide-react';

interface GovHeaderProps {
  role: UserRole;
  lang: LanguageCode;
  onToggleRole: () => void;
  highContrast: boolean;
  onOpenRoleModal: () => void;
  currentUser: { id: string; email: string } | null;
  onOpenAuthModal: () => void;
  onToggleMobileSidebar: () => void;
  onOpenExportModal?: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  role,
  lang,
  onToggleRole,
  highContrast,
  onOpenRoleModal,
  currentUser,
  onOpenAuthModal,
  onToggleMobileSidebar,
  onOpenExportModal,
}) => {
  const t = translations[lang];

  return (
    <header
      id="gov-main-header"
      className={`transition-colors ${
        highContrast
          ? 'bg-black border-b-2 border-yellow-500 text-white'
          : 'bg-white border-b-2 border-[#FF9933] text-gray-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Mobile Menu Toggle & BIS Emblem & Typography */}
        <div className="flex items-center gap-3">
          {role === 'consumer' && (
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-lg text-[#0B3D6B] hover:bg-gray-100 transition"
              title="Toggle Chat History"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            id="bis-emblem-badge"
            className={`flex-shrink-0 w-12 h-16 border-2 flex flex-col items-center justify-center relative ${
              highContrast
                ? 'border-yellow-400 bg-black text-yellow-300'
                : 'border-[#138808] bg-white text-[#0B3D6B]'
            }`}
          >
            <div className="w-6 h-1 bg-[#FF9933] absolute top-2"></div>
            <div className="w-6 h-1 bg-[#138808] absolute bottom-2"></div>
            <span className="text-[8px] text-center font-bold text-[#0B3D6B] leading-tight">
              BIS<br />INDIA
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0B3D6B] leading-none uppercase tracking-tight flex items-center gap-2">
                <span>Pramaan Standards Intelligence</span>
              </h1>
            </div>
            <p className="text-xs font-semibold text-[#138808] mt-1">
              Ministry of Consumer Affairs, Food & Public Distribution, Government of India
            </p>
          </div>
        </div>

        {/* Right: Helplines, User Account & Role Switcher */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Judges Link / Standalone ZIP / Export Button */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0B3D6B]/30 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-[#0B3D6B] transition shadow-2xs cursor-pointer"
              title="Judges Submission Links, Custom Domain deployment, and Standalone ZIP"
            >
              <Globe className="w-4 h-4 text-[#FF9933]" />
              <span className="hidden sm:inline">Judges Link &amp; Custom Domain</span>
              <span className="sm:hidden">Judges Link</span>
            </button>
          )}

          {/* User Account Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 transition shadow-2xs"
            title="User Account & Chat History"
          >
            <div className="w-6 h-6 rounded-full bg-[#0B3D6B] text-white flex items-center justify-center text-[10px] font-bold">
              {currentUser ? currentUser.email.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
            </div>
            <span className="max-w-[120px] truncate">
              {currentUser ? currentUser.email : 'Sign In'}
            </span>
          </button>

          {/* Helpline badge */}
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              National Helpline
            </span>
            <span className="text-xs font-bold text-[#138808] font-mono">
              1915 / 1800-11-1206
            </span>
          </div>

          {/* User Role Card & Switch */}
          <div className="flex flex-col items-end">
            <div
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-[#0B3D6B] text-white'
              }`}
            >
              USER ROLE: {role === 'consumer' ? 'CITIZEN / CONSUMER' : 'INDUSTRY / MSME'}
            </div>
            <button
              id="switch-role-btn"
              onClick={onToggleRole}
              className="text-[#0B3D6B] text-[11px] underline mt-1 font-bold hover:text-[#082d4f] cursor-pointer"
              title="Toggle between Consumer Chatbot and Industry Dashboard"
            >
              {role === 'consumer' ? 'Switch to Industry Mode' : 'Switch to Consumer Mode'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
