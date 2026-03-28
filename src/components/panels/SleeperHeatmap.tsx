'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, ResponsiveContainer, Tooltip,
} from 'recharts';
import type { SleeperReport } from '@/types';

interface LogPoint
{
  log_id: number;
  response_time_ms: number;
  node_id: number;
}

interface ThreatData
{
  sleeper_nodes: SleeperReport[];
}

export default function SleeperHeatmap()
{
  const [logData, setLogData] = useState<LogPoint[]>([]);
  const [sleepers, setSleepers] = useState<SleeperReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadData = () =>
  {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/logs?limit=10000').then((r) => r.json()),
      fetch('/api/threat-report').then((r) => r.json()),
    ]).then(([logs, threat]: [LogPoint[], ThreatData]) =>
    {
      const sampled = logs.filter(
        (_: LogPoint, i: number) => i % 10 === 0
      );
      setLogData(sampled);
      setSleepers(threat.sleeper_nodes);
      setLoading(false);
    }).catch(() =>
    {
      setError('Failed to load sleeper data');
      setLoading(false);
    });
  };
  useEffect(() => { loadData(); }, []);
  const chartData = useMemo(() =>
  {
    return logData.map((log) => ({
      log_id: log.log_id,
      response_time_ms: log.response_time_ms,
    }));
  }, [logData]);
  if (loading)
  {
    return (
      <div className="bg-aegis-surface border border-aegis-border/10 p-6
        flex items-center justify-center min-h-[400px]">
        <div className="text-aegis-accent font-mono text-sm animate-pulse">
          ANALYZING RESPONSE PATTERNS...
        </div>
      </div>
    );
  }
  if (error)
  {
    return (
      <div className="bg-aegis-surface border border-aegis-danger/30 p-6
        flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-aegis-danger font-mono text-xs">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-aegis-danger/10 border border-aegis-danger/30
            text-aegis-danger font-mono text-xs hover:bg-aegis-danger/20"
        >
          RETRY
        </button>
      </div>
    );
  }
  return (
    <div className="bg-aegis-surface border border-aegis-border/10 p-6
      flex flex-col gap-4">
      <div>
        <h2 className="text-xs font-black tracking-[0.2em] text-aegis-accent">
          SLEEPER NODE DETECTION
        </h2>
        <p className="text-[10px] font-mono text-aegis-muted mt-1 uppercase">
          API response time anomaly tracker - threshold 180ms
        </p>
      </div>
      <div className="bg-aegis-bg border border-aegis-border/30 p-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis
              dataKey="log_id"
              stroke="#6B7280"
              tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v: number) => `${v}`}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }}
              domain={[100, 260]}
            />
            <Tooltip
              contentStyle={{
                background: '#111827',
                border: '1px solid #1F2937',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <ReferenceLine
              x={5000}
              stroke="#FACC15"
              strokeDasharray="5 5"
              label={{
                value: 'SCHEMA SWITCH v1->v2',
                position: 'top',
                fill: '#FACC15',
                fontSize: 9,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <ReferenceLine
              y={180}
              stroke="#EF4444"
              strokeDasharray="3 3"
              label={{
                value: 'SLEEPER THRESHOLD',
                position: 'right',
                fill: '#EF4444',
                fontSize: 8,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Line
              type="monotone"
              dataKey="response_time_ms"
              stroke="#00FF88"
              dot={false}
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-[10px] font-mono text-aegis-muted uppercase
          tracking-widest mb-3">
          Top 10 Sleeper Nodes
        </h3>
        <div className="space-y-2">
          {sleepers.map((s, i) => (
            <div key={s.node_id} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-aegis-muted w-5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono text-aegis-text w-16">
                {s.decoded_serial}
              </span>
              <div className="flex-1 h-2 bg-aegis-bg rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    s.mean_response_ms > 200 ? 'bg-aegis-danger'
                      : s.mean_response_ms > 180 ? 'bg-aegis-warning'
                        : 'bg-aegis-accent'
                  }`}
                  style={{
                    width: `${Math.min((s.mean_response_ms / 250) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className={`text-[10px] font-mono font-bold w-14 text-right ${
                s.is_sleeper ? 'text-aegis-danger' : 'text-aegis-accent'
              }`}>
                {s.mean_response_ms}ms
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
