import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  BookOpen,
  Calendar,
  User,
  Hash,
  Info
} from 'lucide-react';
import { LanguageCode, SourceCitation } from '../types';

export interface PrintableChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: SourceCitation[];
  timestamp: string;
  isSimplified?: boolean;
}

interface PrintRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: PrintableChatMessage[];
  conversationTitle?: string;
  conversationId?: string | null;
  currentUser: { id: string; email: string } | null;
  lang: LanguageCode;
}

export const PrintRecordModal: React.FC<PrintRecordModalProps> = ({
  isOpen,
  onClose,
  messages,
  conversationTitle,
  conversationId,
  currentUser,
  lang
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Extract all unique standards cited in this conversation
  const allSources: SourceCitation[] = [];
  const seenStandards = new Set<string>();
  messages.forEach(m => {
    if (m.sources && m.sources.length > 0) {
      m.sources.forEach(s => {
        if (!seenStandards.has(s.standard_number)) {
          seenStandards.add(s.standard_number);
          allSources.push(s);
        }
      });
    }
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const recordRefId = conversationId
    ? `BIS-ADV-${conversationId.substring(0, 8).toUpperCase()}`
    : `BIS-ADV-${Date.now().toString().slice(-8)}`;

  const docTitle = conversationTitle || 'Official BIS Standards & Consumer Inquiry';
  const citizenEmail = currentUser?.email || 'Citizen / Public Consumer (Unregistered)';

  // 1. Direct browser print within the page
  const handlePrintCurrentWindow = () => {
    window.print();
  };

  // 2. Open dedicated standalone printable window (Ideal for iframe sandbox environments & perfect PDF output)
  const handleOpenPrintWindow = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=900,scrollbars=yes');
    if (!printWindow) {
      // If popup was blocked, fallback to standard window.print
      window.print();
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} - BIS Sahayak Official Record</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 20mm 15mm;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 20px;
    }
    .header-banner {
      border-bottom: 2px solid #0B3D6B;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .emblem-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .gov-text {
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #4b5563;
    }
    .main-title {
      font-size: 20px;
      font-weight: 800;
      color: #0B3D6B;
      margin: 2px 0 4px 0;
    }
    .sub-title {
      font-size: 12px;
      color: #374151;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 700;
      color: #0B3D6B;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 11px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      margin-bottom: 2px;
    }
    .meta-value {
      font-weight: 600;
      color: #111827;
      word-break: break-word;
    }
    .standards-summary {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .standards-summary h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      font-weight: 700;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .standards-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .standards-item {
      font-size: 11px;
      color: #1e3a8a;
      background: #ffffff;
      border: 1px solid #dbeafe;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .transcript-heading {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #111827;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 6px;
      margin: 18px 0 12px 0;
    }
    .exchange {
      margin-bottom: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .bubble {
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 8px;
    }
    .user-bubble {
      background-color: #f3f4f6;
      border-left: 4px solid #0B3D6B;
    }
    .assistant-bubble {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-left: 4px solid #138808;
    }
    .bubble-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .user-label {
      color: #0B3D6B;
    }
    .assistant-label {
      color: #138808;
    }
    .time-label {
      color: #6b7280;
      font-weight: 400;
    }
    .content {
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.6;
    }
    .sources-box {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #d1d5db;
      font-size: 11px;
    }
    .sources-box-title {
      font-weight: 700;
      color: #0B3D6B;
      font-size: 10px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .source-row {
      margin-bottom: 4px;
      color: #374151;
    }
    .source-row strong {
      color: #111827;
    }
    .footer-seal-block {
      margin-top: 30px;
      padding-top: 14px;
      border-top: 2px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      page-break-inside: avoid;
      font-size: 10px;
      color: #4b5563;
    }
    .seal-box {
      border: 1.5px dashed #0B3D6B;
      padding: 10px 16px;
      border-radius: 6px;
      text-align: center;
      color: #0B3D6B;
      font-weight: 700;
      background: #f8fafc;
      width: 220px;
    }
    .seal-box small {
      display: block;
      font-size: 8px;
      color: #64748b;
      font-weight: 500;
      margin-top: 4px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print-btn {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-btn" style="background:#0B3D6B; color:#ffffff; padding:12px 18px; margin-bottom:16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
    <div>
      <strong>Official Print Document Ready:</strong> Click the button on the right or press <kbd style="background:#ffffff; color:#0B3D6B; padding:2px 6px; border-radius:4px; font-weight:700;">Ctrl + P</kbd> / <kbd style="background:#ffffff; color:#0B3D6B; padding:2px 6px; border-radius:4px; font-weight:700;">Cmd + P</kbd> to Save as PDF.
    </div>
    <button onclick="window.print()" style="background:#FF9933; color:#ffffff; border:none; padding:8px 16px; font-weight:bold; border-radius:6px; cursor:pointer; font-size:12px;">
      Print / Save as PDF Now
    </button>
  </div>

  <div class="header-banner">
    <div class="emblem-row">
      <div class="gov-text">
        GOVERNMENT OF INDIA &bull; MINISTRY OF CONSUMER AFFAIRS, FOOD &amp; PUBLIC DISTRIBUTION
      </div>
      <div class="badge">
        SIH PS26107 COMPLIANT RECORD
      </div>
    </div>
    <div class="main-title">BUREAU OF INDIAN STANDARDS (BIS)</div>
    <div class="sub-title">BIS Sahayak &mdash; Official Citizen Consultation &amp; Statutory Standards Record</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Consultation Reference ID</span>
      <span class="meta-value">${recordRefId}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Date &amp; Time of Record</span>
      <span class="meta-value">${currentDate} at ${currentTime} (IST)</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Consultation Subject</span>
      <span class="meta-value">${docTitle}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Citizen / Inquirer Account</span>
      <span class="meta-value">${citizenEmail}</span>
    </div>
    <div class="meta-item" style="grid-column: span 2;">
      <span class="meta-label">Statutory Grounding</span>
      <span class="meta-value">Bureau of Indian Standards (BIS) Act, 2016 &bull; Mandatory Quality Control Orders (QCOs) &bull; Verified Conformity Assessment Schemes (ISI Mark, CRS, Hallmarking)</span>
    </div>
  </div>

  ${
    allSources.length > 0
      ? `
  <div class="standards-summary">
    <h4>Mandatory Indian Standards (IS Codes) &amp; Regulatory References Cited (${allSources.length})</h4>
    <ul class="standards-list">
      ${allSources
        .map(
          s => `
        <li class="standards-item">
          <strong>${s.standard_number}</strong>: ${s.title}${s.clause ? ` <em>[${s.clause}]</em>` : ''}
        </li>`
        )
        .join('')}
    </ul>
  </div>`
      : ''
  }

  <div class="transcript-heading">Official Consultation Transcript (${messages.length} Records)</div>

  ${messages
    .map(
      (m, idx) => `
    <div class="exchange">
      <div class="bubble ${m.sender === 'user' ? 'user-bubble' : 'assistant-bubble'}">
        <div class="bubble-meta">
          <span class="${m.sender === 'user' ? 'user-label' : 'assistant-label'}">
            #${idx + 1} ${m.sender === 'user' ? 'Citizen Query / Consumer Inquiry' : 'BIS Sahayak &mdash; Official Advisory Response'}
          </span>
          <span class="time-label">${m.timestamp}</span>
        </div>
        <div class="content">${m.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        ${
          m.sources && m.sources.length > 0
            ? `
          <div class="sources-box">
            <div class="sources-box-title">Certified Reference Standards Cited:</div>
            ${m.sources
              .map(
                s => `
              <div class="source-row">
                &bull; <strong>${s.standard_number}</strong> &mdash; ${s.title}${s.clause ? ` (${s.clause})` : ''}
              </div>`
              )
              .join('')}
          </div>`
            : ''
        }
      </div>
    </div>`
    )
    .join('')}

  <div class="footer-seal-block">
    <div style="max-width: 58%;">
      <strong>Statutory Disclaimer &amp; Notice:</strong>
      <p style="margin:4px 0 6px 0; line-height: 1.4;">
        This document is an authentic computer-generated transcript produced by BIS Sahayak, based on published Indian Standards, Quality Control Orders, and BIS guidelines. To formally verify an active license number, CM/L ID, or report unauthorized ISI use, visit <strong>www.bis.gov.in</strong>, download the <strong>BIS CARE Mobile App</strong>, or contact the National Consumer Helpline at <strong>1915</strong>.
      </p>
      <div>Website: <strong>https://www.bis.gov.in</strong> | Toll-Free: <strong>1800-11-4000</strong></div>
    </div>

    <div class="seal-box">
      BUREAU OF INDIAN STANDARDS
      <div style="font-size:11px; margin:2px 0;">BIS SAHAYAK AI DESK</div>
      <div style="font-size:9px; color:#138808; font-weight:800;">VERIFIED ADVISORY TRANSCRIPT</div>
      <small>Computer-Generated Record &bull; No Physical Signature Required</small>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Small timeout to ensure styles are painted
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // 3. Download text transcript file
  const handleDownloadTxt = () => {
    let text = `========================================================================\n`;
    text += `BUREAU OF INDIAN STANDARDS (BIS) - BIS SAHAYAK\n`;
    text += `OFFICIAL CITIZEN CONSULTATION & STATUTORY STANDARDS RECORD\n`;
    text += `========================================================================\n\n`;
    text += `Reference ID   : ${recordRefId}\n`;
    text += `Generated On   : ${currentDate} at ${currentTime} (IST)\n`;
    text += `Subject        : ${docTitle}\n`;
    text += `Inquirer       : ${citizenEmail}\n`;
    text += `Statutory Basis: Bureau of Indian Standards Act, 2016 & Mandatory QCOs\n\n`;

    if (allSources.length > 0) {
      text += `------------------------------------------------------------------------\n`;
      text += `MANDATORY STANDARDS & REGULATORY REFERENCES CITED (${allSources.length}):\n`;
      text += `------------------------------------------------------------------------\n`;
      allSources.forEach((s, i) => {
        text += `${i + 1}. ${s.standard_number}: ${s.title}${s.clause ? ` [${s.clause}]` : ''}\n`;
      });
      text += `\n`;
    }

    text += `------------------------------------------------------------------------\n`;
    text += `CONSULTATION TRANSCRIPT (${messages.length} MESSAGES):\n`;
    text += `------------------------------------------------------------------------\n\n`;

    messages.forEach((m, idx) => {
      const senderTitle = m.sender === 'user' ? 'CITIZEN INQUIRY' : 'BIS SAHAYAK ADVISORY RESPONSE';
      text += `[#${idx + 1}] ${senderTitle} (${m.timestamp})\n`;
      text += `${m.text}\n`;
      if (m.sources && m.sources.length > 0) {
        text += `\nStandards Cited:\n`;
        m.sources.forEach(s => {
          text += `  - ${s.standard_number}: ${s.title}${s.clause ? ` (${s.clause})` : ''}\n`;
        });
      }
      text += `\n` + `-`.repeat(60) + `\n\n`;
    });

    text += `========================================================================\n`;
    text += `STATUTORY DISCLAIMER:\n`;
    text += `This document is a computer-generated consultative summary provided for\n`;
    text += `consumer informational reference under the BIS Act, 2016. To formally\n`;
    text += `verify an ISI/CRS license number or report non-compliance, visit\n`;
    text += `https://www.bis.gov.in or call National Consumer Helpline 1915.\n`;
    text += `========================================================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BIS_Sahayak_Consultation_${recordRefId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 4. Copy raw transcript to clipboard
  const handleCopyTranscript = () => {
    let text = `BIS SAHAYAK CONSULTATION RECORD (${recordRefId})\n`;
    text += `Date: ${currentDate} ${currentTime}\n\n`;
    messages.forEach((m, i) => {
      text += `${m.sender === 'user' ? 'Citizen' : 'BIS Sahayak'} [${m.timestamp}]:\n${m.text}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#0B3D6B] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Printer className="w-5 h-5 text-[#FF9933]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Print Consultation Record / Save as PDF</h3>
              <p className="text-xs text-blue-200">
                Generate official records for citizen filing, consumer forums, or compliance documentation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-gray-50 border-b border-gray-200 p-3.5 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPrintWindow}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B3D6B] hover:bg-[#082e52] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              title="Opens a clean printable window and triggers Save as PDF"
            >
              <Printer className="w-4 h-4 text-[#FF9933]" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Download formal text report file"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Download (.txt)</span>
            </button>

            <button
              onClick={handleCopyTranscript}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Copy text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#138808]" />
            <span>BIS Act 2016 Grounded</span>
          </div>
        </div>

        {/* Document Preview Area (Formatted as Official Memorandum) */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="bg-white border border-gray-300 shadow-md rounded-lg p-6 sm:p-8 max-w-2xl mx-auto space-y-6 text-gray-800 text-xs">
            {/* Memorandum Header */}
            <div className="border-b-2 border-[#0B3D6B] pb-4 space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <span>Government of India &bull; Ministry of Consumer Affairs</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-[#0B3D6B] border border-gray-200">
                  Record ID: {recordRefId}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0B3D6B]">
                BUREAU OF INDIAN STANDARDS (BIS)
              </h2>
              <p className="text-xs font-semibold text-gray-700">
                BIS Sahayak &mdash; Official Citizen Consultation &amp; Statutory Standards Record
              </p>
            </div>

            {/* Metadata Table */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-[11px]">
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-500">Record Ref No.</span>
                <span className="font-mono font-bold text-gray-900">{recordRefId}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-500">Generated On</span>
                <span className="font-medium text-gray-900">{currentDate} &bull; {currentTime}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-500">Subject Topic</span>
                <span className="font-semibold text-gray-900 truncate block">{docTitle}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-500">Inquirer / Citizen</span>
                <span className="font-medium text-gray-900 truncate block">{citizenEmail}</span>
              </div>
            </div>

            {/* Cited Standards Callout */}
            {allSources.length > 0 && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                  <span>Mandatory Standards &amp; Regulations Cited ({allSources.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {allSources.map((s, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-blue-100 text-blue-950">
                      <div className="font-bold text-[#0B3D6B]">{s.standard_number}</div>
                      <div className="text-[10px] text-gray-600 line-clamp-1">{s.title}</div>
                      {s.clause && <div className="text-[9px] text-gray-500 mt-0.5">Clause: {s.clause}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Transcript */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1">
                Consultation Transcript ({messages.length} Exchanges)
              </div>

              {messages.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <Info className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p>No messages in this consultation yet. Ask a question to print your consultation record.</p>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`p-3.5 rounded-lg border text-xs leading-relaxed space-y-2 ${
                      m.sender === 'user'
                        ? 'bg-gray-50 border-gray-200 border-l-4 border-l-[#0B3D6B]'
                        : 'bg-white border-gray-200 border-l-4 border-l-[#138808]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={m.sender === 'user' ? 'text-[#0B3D6B]' : 'text-[#138808]'}>
                        #{idx + 1} {m.sender === 'user' ? 'Citizen Query' : 'BIS Sahayak Advisory Response'}
                      </span>
                      <span className="text-gray-400 font-normal">{m.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap text-gray-800 font-normal">
                      {m.text}
                    </div>

                    {m.sources && m.sources.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-600">
                        <span className="font-bold text-gray-700">Standards Cited: </span>
                        {m.sources.map(s => s.standard_number).join(', ')}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Verification Stamp */}
            <div className="pt-6 border-t-2 border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] text-gray-500">
              <div className="space-y-1 max-w-sm">
                <div className="font-bold text-gray-700">Bureau of Indian Standards Act, 2016</div>
                <p className="leading-normal">
                  Authentic computer-generated record for citizen informational reference. To verify licensee marks or file consumer complaints, use www.bis.gov.in or dial 1915.
                </p>
              </div>

              <div className="border border-dashed border-[#0B3D6B] rounded p-2.5 text-center shrink-0 w-full sm:w-48 bg-blue-50/40 text-[#0B3D6B]">
                <div className="font-extrabold tracking-wide">BIS SAHAYAK AI DESK</div>
                <div className="text-[9px] text-[#138808] font-bold">COMPUTER-VERIFIED</div>
                <div className="text-[8px] text-gray-400">No Physical Signature Required</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            Smart India Hackathon 2026 &bull; Prototype: <strong>BIS Sahayak</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPrintWindow}
              className="px-4 py-2 bg-[#0B3D6B] hover:bg-[#082e52] text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
