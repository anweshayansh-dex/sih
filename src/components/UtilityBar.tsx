/**
 * Top Government Utility Bar
 * Authentic .gov.in standard accessibility controls
 */

import React from 'react';
import { LanguageCode } from '../types';
import { translations } from '../translations';
import { Eye, Type, Globe, Shield, FolderArchive } from 'lucide-react';

interface UtilityBarProps {
  lang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onFontSizeChange: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenExportModal?: () => void;
}

export const UtilityBar: React.FC<UtilityBarProps> = ({
  lang,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  highContrast,
  onToggleHighContrast,
  onOpenExportModal,
}) => {
  const t = translations[lang];

  return (
    <div
      id="gov-utility-bar"
      className={`border-b py-1 px-4 sm:px-6 transition-colors text-[11px] font-medium tracking-tight ${
        highContrast
          ? 'bg-black text-yellow-300 border-yellow-500'
          : 'bg-gray-100 text-gray-600 border-gray-300'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Skip to content & Accessibility */}
        <div className="flex items-center gap-4 uppercase text-[10px] sm:text-[11px]">
          <a
            href="#main-content"
            className="hover:text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0B3D6B]"
            id="skip-to-content-link"
          >
            {t.skipToContent}
          </a>
          <span className="text-gray-400">|</span>
          <span className="hidden sm:inline">Screen Reader Access</span>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="text-[#0B3D6B] font-bold hidden md:inline">{t.govOfIndia}</span>
          {onOpenExportModal && (
            <>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <button
                onClick={onOpenExportModal}
                className="inline-flex items-center gap-1 font-bold text-[#0B3D6B] hover:text-[#082e52] cursor-pointer"
                title="Download standalone prototype ZIP or open directly"
              >
                <FolderArchive className="w-3 h-3 text-[#FF9933]" />
                <span>Export / Standalone</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Accessibility Controls & Language */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Font Size Adjuster - Segmented Border Box */}
          <div className="flex border border-gray-300 bg-white text-[11px]" title={t.fontSize}>
            <button
              id="font-size-small"
              onClick={() => onFontSizeChange('normal')}
              className={`px-2 py-0.5 border-r border-gray-300 hover:bg-gray-200 transition-colors font-mono cursor-pointer ${
                fontSize === 'normal' ? 'bg-[#0B3D6B] text-white font-bold' : 'text-gray-700'
              }`}
              aria-label="Normal Font Size"
            >
              A-
            </button>
            <button
              id="font-size-normal"
              onClick={() => onFontSizeChange('large')}
              className={`px-2 py-0.5 border-r border-gray-300 hover:bg-gray-200 transition-colors font-mono cursor-pointer ${
                fontSize === 'large' ? 'bg-[#0B3D6B] text-white font-bold' : 'text-gray-700'
              }`}
              aria-label="Large Font Size"
            >
              A
            </button>
            <button
              id="font-size-large"
              onClick={() => onFontSizeChange('xlarge')}
              className={`px-2 py-0.5 hover:bg-gray-200 transition-colors font-mono cursor-pointer ${
                fontSize === 'xlarge' ? 'bg-[#0B3D6B] text-white font-bold' : 'text-gray-700'
              }`}
              aria-label="Extra Large Font Size"
            >
              A+
            </button>
          </div>

          <span className="text-gray-400 hidden sm:inline">|</span>

          {/* High Contrast Toggle */}
          <button
            id="toggle-high-contrast"
            onClick={onToggleHighContrast}
            className={`flex items-center gap-1 px-2 py-0.5 border text-[11px] font-semibold uppercase tracking-tight cursor-pointer ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                : 'bg-white border-gray-300 hover:bg-gray-200 text-gray-700'
            }`}
            title={highContrast ? t.normalContrast : t.highContrast}
          >
            <Eye className="w-3 h-3" />
            <span>{highContrast ? 'Standard' : 'Contrast'}</span>
          </button>

          <span className="text-gray-400 hidden sm:inline">|</span>

          {/* Language Selector */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-gray-500 font-medium">Language:</span>
            <button
              onClick={() => onLanguageChange('en')}
              className={`cursor-pointer ${
                lang === 'en'
                  ? 'text-[#0B3D6B] font-bold border-b border-[#0B3D6B]'
                  : 'text-gray-600 hover:text-[#0B3D6B]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`cursor-pointer ${
                lang === 'hi'
                  ? 'text-[#0B3D6B] font-bold border-b border-[#0B3D6B]'
                  : 'text-gray-600 hover:text-[#0B3D6B]'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLanguageChange('or')}
              className={`cursor-pointer ${
                lang === 'or'
                  ? 'text-[#0B3D6B] font-bold border-b border-[#0B3D6B]'
                  : 'text-gray-600 hover:text-[#0B3D6B]'
              }`}
            >
              ଓଡ଼ିଆ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
