/**
 * BIS Industry & MSME Dashboard
 * Semi-structured government compliance workspace with docked AI assistant
 */

import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { translations } from '../translations';
import {
  LayoutDashboard,
  Search,
  Award,
  FileCheck,
  FlaskConical,
  ShieldCheck,
  AlertOctagon,
  ArrowRightLeft,
  BarChart3,
  Bot,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

import { FindStandardView } from './FindStandardView';
import { SchemesView } from './SchemesView';
import { LicenseTrackerView } from './LicenseTrackerView';
import { LabsView } from './LabsView';
import { HuidVerifierView } from './HuidVerifierView';
import { ComplaintCenterView } from './ComplaintCenterView';
import { StandardsCompareView } from './StandardsCompareView';
import { AdminMetricsView } from './AdminMetricsView';
import { DockedAssistant } from './DockedAssistant';

interface IndustryDashboardProps {
  lang: LanguageCode;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const IndustryDashboard: React.FC<IndustryDashboardProps> = ({
  lang,
  highContrast,
  fontSize,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState('overview');
  const [isDockedAiOpen, setIsDockedAiOpen] = useState(false);
  const [injectedPrompt, setInjectedPrompt] = useState<string | null>(null);

  const navItems = [
    { id: 'overview', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'find-standard', label: t.navFindStandard, icon: Search },
    { id: 'schemes', label: t.navSchemes, icon: Award },
    { id: 'license-track', label: t.navLicenseTrack, icon: FileCheck },
    { id: 'labs', label: t.navLabs, icon: FlaskConical },
    { id: 'compare', label: t.navCompare, icon: ArrowRightLeft },
    { id: 'huid-verify', label: t.navHuidVerify, icon: ShieldCheck },
    { id: 'complaints', label: t.navComplaints, icon: AlertOctagon },
    { id: 'admin', label: t.navAdmin, icon: BarChart3 },
  ];

  const handleAskAbout = (query: string) => {
    setInjectedPrompt(query);
    setIsDockedAiOpen(true);
  };

  return (
    <div className="flex flex-col bg-gray-50 flex-1 min-h-[calc(100vh-140px)]">
      {/* Top Secondary Navigation Bar matching Clean Minimalism */}
      <nav
        id="industry-top-nav"
        className={`px-4 sm:px-8 flex gap-6 sm:gap-8 text-[13px] font-semibold h-11 items-center overflow-x-auto whitespace-nowrap shadow-xs select-none ${
          highContrast
            ? 'bg-black text-yellow-300 border-b-2 border-yellow-500'
            : 'bg-[#0B3D6B] text-white'
        }`}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`h-full flex items-center px-1 uppercase text-xs sm:text-[13px] tracking-wide transition-all cursor-pointer ${
                isActive
                  ? 'border-b-4 border-[#FF9933] font-bold text-white opacity-100'
                  : 'opacity-75 hover:opacity-100 text-slate-100 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Main Workspace Structure (Sidebar + Content) */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6 flex-1">
        {/* Left Navigation Sidebar */}
        <aside
          id="industry-sidebar"
          className={`w-full md:w-56 flex-shrink-0 border flex flex-col shadow-xs self-start ${
            highContrast
              ? 'bg-black border-yellow-500 text-white'
              : 'bg-white border-gray-300'
          }`}
        >
          {/* Welcome User Header */}
          <div className="p-4 border-b border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">
              Welcome User
            </p>
            <p className="text-sm font-bold text-[#0B3D6B]">
              Bharat Electronics Ltd.
            </p>
            <p className="text-[10px] text-gray-400 font-mono">
              ID: MSME/KAR/2023/12839
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto text-[13px] divide-y divide-gray-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left p-3 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gray-100 border-l-4 border-[#0B3D6B] font-bold text-[#0B3D6B]'
                      : 'hover:bg-gray-50 border-l-4 border-transparent text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B3D6B]' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0B3D6B]" />}
                </button>
              );
            })}
          </nav>

          {/* Support Helpline Footer inside Sidebar */}
          <div className="p-4 bg-[#f8f9fa] border-t border-gray-200">
            <p className="text-[11px] font-bold text-[#0B3D6B] mb-1">Support Helpline</p>
            <p className="text-base sm:text-lg font-bold text-[#138808] font-mono">1800-11-1206</p>
            <p className="text-[10px] text-gray-500 mt-1">Mon-Fri 09:00 - 17:30 IST</p>

            <button
              onClick={() => setIsDockedAiOpen(true)}
              className="mt-3 w-full p-2 bg-[#0B3D6B] hover:bg-[#082d4f] text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask BIS AI</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 min-w-0 space-y-6">
          {/* Tab 1: Overview Dashboard */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 3 Metric Cards matching Clean Minimalism */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 p-4 shadow-xs">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Active ISI Licenses
                  </p>
                  <p className="text-3xl font-bold text-[#0B3D6B] mt-1 font-mono">04</p>
                  <div className="h-1 w-full bg-gray-200 mt-3">
                    <div className="h-full bg-[#138808] w-[75%]"></div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Valid until March 2027</p>
                </div>

                <div className="bg-white border border-gray-200 p-4 shadow-xs">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Pending Lab Tests
                  </p>
                  <p className="text-3xl font-bold text-[#0B3D6B] mt-1 font-mono">07</p>
                  <div className="h-1 w-full bg-gray-200 mt-3">
                    <div className="h-full bg-[#FF9933] w-[40%]"></div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium">At Central & Regional Labs</p>
                </div>

                <div className="bg-white border border-gray-200 p-4 shadow-xs">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Standards Updated
                  </p>
                  <p className="text-3xl font-bold text-[#0B3D6B] mt-1 font-mono">02</p>
                  <p
                    onClick={() => setActiveTab('find-standard')}
                    className="text-[10px] text-blue-600 mt-2 font-bold cursor-pointer hover:underline"
                  >
                    View IS 16046 revision →
                  </p>
                </div>
              </div>

              {/* Application Lifecycle Tracker Table */}
              <div className="bg-white border border-gray-200 flex flex-col shadow-xs overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-gray-700 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#0B3D6B]" />
                    <span>Application Lifecycle Tracker</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab('schemes')}
                    className="text-[10px] px-2.5 py-1 bg-[#0B3D6B] hover:bg-[#082d4f] text-white uppercase font-bold cursor-pointer"
                  >
                    New Application
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b-2 border-gray-100 text-gray-400 uppercase text-[10px]">
                        <th className="pb-2 font-bold">App ID</th>
                        <th className="pb-2 font-bold">Standard No.</th>
                        <th className="pb-2 font-bold">Category</th>
                        <th className="pb-2 font-bold">Status</th>
                        <th className="pb-2 font-bold">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 divide-y divide-gray-50">
                      <tr>
                        <td className="py-3 font-bold text-[#0B3D6B] font-mono">APP-88219</td>
                        <td className="font-semibold">IS 1293:2019</td>
                        <td>Plugs & Sockets</td>
                        <td>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 font-bold uppercase text-[9px] border border-yellow-300">
                            Factory Inspection
                          </span>
                        </td>
                        <td className="text-gray-500">22 Oct 2025</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-bold text-[#0B3D6B] font-mono">APP-88450</td>
                        <td className="font-semibold">IS 15885:2011</td>
                        <td>LED Drivers</td>
                        <td>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 font-bold uppercase text-[9px] border border-blue-300">
                            Lab Testing
                          </span>
                        </td>
                        <td className="text-gray-500">23 Oct 2025</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-bold text-[#0B3D6B] font-mono">LIC-44912</td>
                        <td className="font-semibold">IS 16046:2018</td>
                        <td>Li-ion Cells</td>
                        <td>
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 font-bold uppercase text-[9px] border border-green-300">
                            License Active
                          </span>
                        </td>
                        <td className="text-gray-500">15 Oct 2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quality Control Orders Section */}
              <div className="bg-white border border-gray-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <h3 className="font-bold text-xs text-[#0B3D6B] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#FF9933]" />
                    <span>Recent Quality Control Orders (QCO) & Circulars</span>
                  </h3>
                  <span className="text-[11px] text-gray-500">Ministry of Consumer Affairs</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-gray-50 border-l-4 border-l-rose-600 border border-gray-200">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span>Packaged Drinking Water & Mineral Water (QCO 2024-25)</span>
                      <span className="text-[9px] font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 border border-rose-200 uppercase font-bold">
                        Mandatory ISI Mark
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] mt-1">
                      Applicable Standards: <strong>IS 14543:2016</strong> and <strong>IS 13428:2005</strong>. No unit may manufacture, pack, or sell without a valid BIS CML license.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 border-l-4 border-l-[#FF9933] border border-gray-200">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span>Compulsory Registration Scheme (CRS) for Power Banks & Batteries</span>
                      <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 border border-amber-200 uppercase font-bold">
                        Scheme II
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] mt-1">
                      Applicable Standards: <strong>IS 16046 (Part 2):2018</strong>. Requires test report from MeitY/NABL recognized test lab within 90 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Find Standard */}
          {activeTab === 'find-standard' && (
            <FindStandardView
              lang={lang}
              highContrast={highContrast}
              onAskAboutStandard={(num, title) =>
                handleAskAbout(`Please provide detailed technical guidance for standard ${num}: ${title}. What are the testing clauses, fees, and factory audit requirements?`)
              }
            />
          )}

          {/* Tab 3: Schemes */}
          {activeTab === 'schemes' && (
            <SchemesView
              lang={lang}
              highContrast={highContrast}
              onAskAboutScheme={(name) =>
                handleAskAbout(`Please explain the application steps, fee concession for MSMEs, and approx timeline for ${name}.`)
              }
            />
          )}

          {/* Tab 4: License Tracker */}
          {activeTab === 'license-track' && (
            <LicenseTrackerView
              lang={lang}
              highContrast={highContrast}
              onAskAboutLicense={(num, prod) =>
                handleAskAbout(`What are the next operational steps and compliance requirements for BIS license ${num} (${prod})?`)
              }
            />
          )}

          {/* Tab 5: Labs */}
          {activeTab === 'labs' && (
            <LabsView lang={lang} highContrast={highContrast} />
          )}

          {/* Tab 6: Compare Standards */}
          {activeTab === 'compare' && (
            <StandardsCompareView lang={lang} highContrast={highContrast} />
          )}

          {/* Tab 7: HUID Verifier */}
          {activeTab === 'huid-verify' && (
            <HuidVerifierView
              lang={lang}
              highContrast={highContrast}
              onAskAboutHallmarking={() =>
                handleAskAbout("What is the complete process to register a jewellery store with BIS and get articles hallmarked at an AHC centre?")
              }
            />
          )}

          {/* Tab 8: Complaints */}
          {activeTab === 'complaints' && (
            <ComplaintCenterView
              lang={lang}
              highContrast={highContrast}
              onAskAboutComplaint={() =>
                handleAskAbout("How does BIS investigate counterfeit ISI marks and what evidence should be preserved by complainant?")
              }
            />
          )}

          {/* Tab 9: Admin Metrics */}
          {activeTab === 'admin' && (
            <AdminMetricsView lang={lang} highContrast={highContrast} />
          )}
        </main>
      </div>

      {/* Docked AI Assistant */}
      <DockedAssistant
        lang={lang}
        highContrast={highContrast}
        activeTab={activeTab}
        isOpen={isDockedAiOpen}
        onToggleOpen={() => setIsDockedAiOpen(!isDockedAiOpen)}
        injectedPrompt={injectedPrompt}
        onClearInjectedPrompt={() => setInjectedPrompt(null)}
      />
    </div>
  );
};
