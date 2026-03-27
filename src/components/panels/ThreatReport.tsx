'use client';

import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import type { ThreatReport } from '@/types';

export default function ThreatReportPanel()
{
  const [report, setReport] = useState<ThreatReport | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() =>
  {
    fetch('/api/threat-report')
      .then((r) => r.json())
      .then((data: ThreatReport) =>
      {
        setReport(data);
        setLoading(false);
      });
  }, []);
  if (loading || !report)
  {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-aegis-accent font-mono text-sm animate-pulse">
          COMPILING THREAT INTELLIGENCE...
        </div>
      </div>
    );
  }
  const pieData = [
    { name: 'Clean', value: report.clean_count, color: '#00FF88' },
    { name: 'Infected', value: report.infected_count, color: '#EF4444' },
  ];
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-aegis-border pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-aegis-text
            font-headline uppercase">
            AEGIS THREAT ASSESSMENT REPORT
          </h1>
          <div className="flex items-center gap-4 text-aegis-muted font-mono
            text-xs uppercase mt-2">
            <span>
              Status: <span className="text-aegis-accent">
                Active Intelligence Gathering
              </span>
            </span>
            <span>-</span>
            <span>
              Nodes Analyzed: <span className="text-aegis-text">
                {report.total_nodes}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-aegis-surface p-6 border-l-2 border-aegis-danger">
            <h3 className="text-xs font-mono text-aegis-muted uppercase
              tracking-widest mb-6">
              Global Severity Index
            </h3>
            <div className="relative pt-4">
              <div className="h-4 w-full rounded-full bg-gradient-to-r
                from-[#00FF88] via-yellow-400 to-red-600 relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                    flex flex-col items-center"
                  style={{
                    left: `${Math.min(
                      (report.infected_count / report.total_nodes) * 500,
                      95
                    )}%`,
                  }}
                >
                  <div className="w-1 h-8 bg-white
                    shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10" />
                  <div className="mt-1 text-[10px] font-mono text-white
                    bg-black px-1">
                    {report.infected_count > 50 ? 'CRITICAL' : 'ELEVATED'}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-3 font-mono text-[10px]
                text-aegis-muted uppercase">
                <span>Low</span>
                <span>Elevated</span>
                <span>Critical</span>
              </div>
            </div>
          </div>
          <div className="bg-aegis-surface p-8 flex flex-col items-center
            justify-center">
            <h3 className="text-xs font-mono text-aegis-muted uppercase
              tracking-widest mb-8 self-start">
              Integrity Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid #1F2937',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-8 w-full">
              <div className="text-center">
                <div className="text-[10px] font-mono text-aegis-muted
                  uppercase mb-1">
                  Clean
                </div>
                <div className="text-xl font-bold text-aegis-accent font-mono">
                  {report.clean_count}
                </div>
              </div>
              <div className="text-center border-l border-aegis-border">
                <div className="text-[10px] font-mono text-aegis-muted
                  uppercase mb-1">
                  Infected
                </div>
                <div className="text-xl font-bold text-aegis-danger font-mono">
                  {report.infected_count}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1
          md:grid-cols-3 gap-6">
          <div className="bg-aegis-surface border-t-2 border-aegis-warning
            p-6 flex flex-col hover:brightness-110 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span
                className="material-symbols-outlined text-aegis-warning"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              <span className="text-[10px] font-mono bg-aegis-warning/10
                text-aegis-warning px-2 py-0.5">
                HTTP 429
              </span>
            </div>
            <h4 className="text-lg font-bold text-aegis-text mb-2">
              DDoS Targets
            </h4>
            <p className="text-sm text-aegis-muted mb-6 flex-1">
              High-frequency request spikes detected across gateway clusters.
            </p>
            <div className="mt-auto">
              <div className="text-2xl font-black font-mono text-aegis-text">
                {report.ddos_count}
              </div>
              <div className="text-[10px] font-mono text-aegis-muted uppercase">
                Active Vectors
              </div>
            </div>
          </div>
          <div className="bg-aegis-surface border-t-2 border-aegis-danger
            p-6 flex flex-col hover:brightness-110 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span
                className="material-symbols-outlined text-aegis-danger"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                router
              </span>
              <span className="text-[10px] font-mono bg-aegis-danger/10
                text-aegis-danger px-2 py-0.5">
                HTTP 206
              </span>
            </div>
            <h4 className="text-lg font-bold text-aegis-text mb-2">
              Hijacked Nodes
            </h4>
            <p className="text-sm text-aegis-muted mb-6 flex-1">
              Nodes responding with partial content indicating unauthorized
              data exfiltration.
            </p>
            <div className="mt-auto">
              <div className="text-2xl font-black font-mono text-aegis-text">
                {report.hijacked_count}
              </div>
              <div className="text-[10px] font-mono text-aegis-muted uppercase">
                Compromised Hubs
              </div>
            </div>
          </div>
          <div className="bg-aegis-surface border-t-2 border-red-600
            p-6 flex flex-col hover:brightness-110 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span
                className="material-symbols-outlined text-red-600"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bug_report
              </span>
              <span className="text-[10px] font-mono bg-red-600/10
                text-red-600 px-2 py-0.5">
                MALWARE
              </span>
            </div>
            <h4 className="text-lg font-bold text-aegis-text mb-2">
              Known Infected
            </h4>
            <p className="text-sm text-aegis-muted mb-6 flex-1">
              Confirmed payload execution. Immediate isolation protocols
              recommended.
            </p>
            <div className="mt-auto">
              <div className="text-2xl font-black font-mono text-aegis-text">
                {report.infected_count}
              </div>
              <div className="text-[10px] font-mono text-aegis-muted uppercase">
                Critical Threats
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-aegis-surface border border-red-900/50 p-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10
          pointer-events-none transform rotate-45 translate-x-16 -translate-y-16" />
        <div className="grid grid-cols-12 gap-8 items-center relative z-10">
          <div className="col-span-12 md:col-span-2 flex items-center
            justify-center">
            <span
              className="material-symbols-outlined text-6xl text-aegis-danger"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
          </div>
          <div className="col-span-12 md:col-span-7 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono bg-red-600 text-white
                px-2 py-0.5 tracking-tighter">
                CLASSIFIED
              </span>
              <h2 className="text-2xl font-black font-headline tracking-tighter
                uppercase text-aegis-text">
                Shadow Controller Identified
              </h2>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-aegis-muted leading-relaxed">
                The entity responsible for coordinating the botnet mobilization
                has been localized. Signatures match high-density patterns of
                infected-node DDoS activity.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-aegis-bg p-3 border border-aegis-border">
                  <div className="text-[9px] font-mono text-aegis-muted uppercase">
                    Node ID
                  </div>
                  <div className="text-xs font-mono text-aegis-accent">
                    {report.shadow_controller.node_id}
                  </div>
                </div>
                <div className="bg-aegis-bg p-3 border border-aegis-border">
                  <div className="text-[9px] font-mono text-aegis-muted uppercase">
                    Decoded Serial
                  </div>
                  <div className="text-xs font-mono text-aegis-accent">
                    {report.shadow_controller.decoded_serial}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3 flex flex-col gap-3">
            <div className="bg-aegis-bg p-3 border border-aegis-border
              text-center">
              <div className="text-[9px] font-mono text-aegis-muted uppercase">
                Infected + 429 Count
              </div>
              <div className="text-2xl font-black font-mono text-aegis-danger">
                {report.shadow_controller.infected_429_count}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
