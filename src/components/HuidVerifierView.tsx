/**
 * Gold & Silver Hallmarking & 6-Digit HUID Verifier
 * Compliant with IS 1417:2016 and BIS Hallmarking Regulations
 */

import React, { useState } from 'react';
import { LanguageCode, HuidVerificationResult } from '../types';
import { translations } from '../translations';
import { ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, Search, Info, HelpCircle, ExternalLink } from 'lucide-react';

interface HuidVerifierViewProps {
  lang: LanguageCode;
  highContrast: boolean;
  onAskAboutHallmarking: () => void;
}

export const HuidVerifierView: React.FC<HuidVerifierViewProps> = ({
  lang,
  highContrast,
  onAskAboutHallmarking,
}) => {
  const t = translations[lang];
  const [huidInput, setHuidInput] = useState('AY786K');
  const [result, setResult] = useState<HuidVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleHuids = [
    { code: 'AY786K', label: 'Sample Gold Bangle (22K 916)' },
    { code: 'AB1234', label: 'Sample Gold Necklace (18K 750)' },
    { code: '916XYZ', label: 'Sample Gold Ring (22K)' },
    { code: 'INVALID99', label: 'Invalid Code (9 digits)' }
  ];

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || huidInput).trim();
    if (!code) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/verify-huid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ huid: code })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on first load
  React.useEffect(() => {
    handleVerify('AY786K');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>BIS Hallmarking Unique Identification (HUID) System</span>
        </div>
        <h2 className="text-xl font-bold text-[#0B3D6B]">
          Gold Hallmark & 6-Digit HUID Authenticity Checker
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Verify genuine gold purity standards under <strong>IS 1417:2016</strong>. Every genuine hallmarked jewellery article in India carries a laser-engraved 6-character alphanumeric HUID assigned by a BIS Assaying & Hallmarking Centre (AHC).
        </p>

        {/* Input Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 max-w-xl">
          <input
            type="text"
            maxLength={10}
            value={huidInput}
            onChange={(e) => setHuidInput(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit HUID code (e.g. AY786K)"
            className="flex-1 border border-slate-300 rounded-xs px-3.5 py-2 text-sm font-mono tracking-widest uppercase focus:ring-2 focus:ring-[#0B3D6B] bg-slate-50 text-slate-900 font-bold"
          />
          <button
            onClick={() => handleVerify()}
            disabled={isLoading || !huidInput.trim()}
            className="px-5 py-2 bg-[#0B3D6B] hover:bg-[#082d4f] text-white text-xs sm:text-sm font-bold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Verifying...' : 'Verify HUID'}</span>
          </button>
        </div>

        {/* Sample HUID Buttons */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold">Test Sample HUIDs:</span>
          {sampleHuids.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setHuidInput(s.code);
                handleVerify(s.code);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-amber-100 text-[#0B3D6B] font-mono border border-slate-300 rounded-xs text-[11px] font-bold cursor-pointer"
            >
              {s.code} ({s.label.split(' ')[1]})
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className="bg-white border-2 border-slate-300 rounded-xs p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              {result.valid_format ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              )}
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  {result.valid_format
                    ? `Genuine Hallmark Verified: Code ${result.huid}`
                    : `Invalid HUID Code: ${result.huid}`}
                </h3>
                <p className="text-xs text-slate-600">{result.explanation}</p>
              </div>
            </div>

            <button
              onClick={onAskAboutHallmarking}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-xs flex items-center gap-1 cursor-pointer shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ask AI About Hallmarking</span>
            </button>
          </div>

          {result.valid_format && result.details && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                  Gold Purity & Fineness
                </div>
                <div className="font-bold text-sm text-[#0B3D6B]">
                  {result.details.purity}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">Standard: IS 1417:2016</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                  Article Description
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {result.details.article_type}
                </div>
                <div className="text-[11px] text-slate-600">
                  Weight: {result.details.weight_approx}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                  Hallmarking Date
                </div>
                <div className="font-bold text-sm text-slate-900 font-mono">
                  {result.details.hallmarking_date}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">Active in Central AHC DB</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs sm:col-span-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                  Certified Jeweller & Registration ID
                </div>
                <div className="font-semibold text-xs text-slate-800">
                  {result.details.jeweller_id}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                  Assaying & Hallmarking Centre (AHC)
                </div>
                <div className="font-semibold text-xs text-slate-800">
                  {result.details.ahc_name}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3 Hallmark Marks Consumer Guide Banner */}
      <div className="bg-amber-50/70 border border-amber-300 p-5 rounded-xs">
        <h4 className="font-bold text-sm text-amber-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-amber-700" />
          <span>The 3 Mandatory Marks on Gold Jewellery in India</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-800">
          <div className="p-3 bg-white border border-amber-200 rounded-xs">
            <div className="font-bold text-[#0B3D6B] mb-1">1. BIS Standard Logo</div>
            <p className="text-slate-600 text-[11px]">
              Triangular official BIS hallmark mark indicating government quality compliance.
            </p>
          </div>
          <div className="p-3 bg-white border border-amber-200 rounded-xs">
            <div className="font-bold text-[#0B3D6B] mb-1">2. Purity & Fineness</div>
            <p className="text-slate-600 text-[11px]">
              E.g. 22K916 (91.6% gold), 18K750 (75.0% gold), or 14K585 (58.5% gold).
            </p>
          </div>
          <div className="p-3 bg-white border border-amber-200 rounded-xs">
            <div className="font-bold text-[#0B3D6B] mb-1">3. 6-Digit HUID Code</div>
            <p className="text-slate-600 text-[11px]">
              Unique alphanumeric serial laser-engraved on every single jewellery piece.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
