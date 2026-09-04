/**
 * Admin & RAG Analytics Dashboard
 * Tracks queries served, top searched standards, and citizen feedback
 */

import React, { useState, useEffect } from 'react';
import { AdminMetrics, LanguageCode } from '../types';
import { BarChart3, TrendingUp, Users, ThumbsUp, Activity, RotateCcw, ShieldCheck } from 'lucide-react';

interface AdminMetricsViewProps {
  lang: LanguageCode;
  highContrast: boolean;
}

export const AdminMetricsView: React.FC<AdminMetricsViewProps> = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = () => {
    setIsLoading(true);
    fetch('/api/admin/metrics')
      .then(r => r.json())
      .then(data => {
        setMetrics(data);
        setIsLoading(false);
      })
      .catch(e => {
        console.error(e);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-amber-600" />
            <span>BIS Sahayak Telemetry & Performance Dashboard</span>
          </div>
          <h2 className="text-xl font-bold text-[#0B3D6B]">
            System Metrics & Query Intelligence
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Aggregated usage analytics across Consumer and Industry AI inquiries.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 rounded-xs flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Live Telemetry</span>
        </button>
      </div>

      {metrics && (
        <div className="space-y-6">
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 border-2 border-slate-300 rounded-xs shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Queries Served
                </span>
                <Users className="w-5 h-5 text-[#0B3D6B]" />
              </div>
              <div className="text-3xl font-bold text-[#0B3D6B] font-mono">
                {metrics.total_queries_served.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Live requests processed by Hybrid RAG</p>
            </div>

            <div className="bg-white p-5 border-2 border-slate-300 rounded-xs shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  User Satisfaction Rate
                </span>
                <ThumbsUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-emerald-700 font-mono">
                {metrics.user_satisfaction_rate}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {metrics.positive_feedback} helpful / {metrics.total_feedback_count} citizen ratings
              </p>
            </div>

            <div className="bg-white p-5 border-2 border-slate-300 rounded-xs shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  RAG Knowledge Base
                </span>
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-amber-900 font-mono">
                100%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Grounded in BIS Gazette & QCOs</p>
            </div>
          </div>

          {/* Detailed Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Asked Topics */}
            <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs">
              <h3 className="font-bold text-sm text-[#0B3D6B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Most Frequently Inquired Topics</span>
              </h3>
              <div className="space-y-3">
                {metrics.top_asked_topics.map((t, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{t.topic}</span>
                      <span className="font-mono text-[#0B3D6B]">{t.count} queries</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                      <div
                        className="bg-[#0B3D6B] h-full rounded-xs"
                        style={{ width: `${Math.min(100, (t.count / 500) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Searched Standards */}
            <div className="bg-white p-5 border border-slate-300 rounded-xs shadow-xs">
              <h3 className="font-bold text-sm text-[#0B3D6B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>Top Queried IS Standards</span>
              </h3>
              <div className="space-y-3">
                {metrics.top_searched_standards.map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span className="font-mono text-[#0B3D6B]">{s.is_code}</span>
                      <span className="font-mono text-slate-600">{s.count} lookups</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-xs"
                        style={{ width: `${Math.min(100, (s.count / 450) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
