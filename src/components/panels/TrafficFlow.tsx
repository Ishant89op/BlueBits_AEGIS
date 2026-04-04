'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell,
} from 'recharts';
import type { TrafficFlowData, BalancerAlgorithm } from '@/types/resilience';

const ALGO_OPTIONS: { value: BalancerAlgorithm; label: string }[] = [
  { value: 'round-robin', label: 'ROUND ROBIN' },
  { value: 'least-latency', label: 'LEAST LATENCY' },
  { value: 'weighted', label: 'WEIGHTED' },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: '#00FF88',
  dropped: '#EF4444',
  rerouted: '#FACC15',
  'in-transit': '#3B82F6',
};

export default function TrafficFlow()
{
  const [traffic, setTraffic] = useState<TrafficFlowData | null>(null);
  const [algorithm, setAlgorithm] = useState<BalancerAlgorithm>('round-robin');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchTraffic = useCallback(() =>
  {
    fetch(`/api/resilience/traffic?algorithm=${algorithm}&count=100`)
      .then((r) => r.json())
      .then((data: TrafficFlowData) =>
      {
        setTraffic(data);
        setLoading(false);
      });
  }, [algorithm]);

  useEffect(() =>
  {
    fetchTraffic();
  }, [fetchTraffic]);

  useEffect(() =>
  {
    if (!autoRefresh) return;
    const interval = setInterval(fetchTraffic, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTraffic]);

  if (loading || !traffic)
  {
    return (
      <div className="bg-aegis-surface border border-aegis-border/10 p-6
        flex items-center justify-center min-h-[400px]">
        <div className="text-aegis-accent font-mono text-sm animate-pulse">
          GENERATING TRAFFIC FLOW...
        </div>
      </div>
    );
  }

  const barData = [
    { name: 'Delivered', value: traffic.total_delivered, color: STATUS_COLORS.delivered },
    { name: 'Rerouted', value: traffic.total_rerouted, color: STATUS_COLORS.rerouted },
    { name: 'Dropped', value: traffic.total_dropped, color: STATUS_COLORS.dropped },
  ];

  const deliveryRate = traffic.total_sent > 0
    ? Math.round((traffic.total_delivered / traffic.total_sent) * 10000) / 100
    : 0;

  return (
    <div className="bg-aegis-surface border border-aegis-border/10 p-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xs font-black tracking-[0.2em] text-aegis-accent">
            REAL-TIME TRAFFIC FLOW VISUALIZER
          </h2>
          <p className="text-[10px] font-mono text-aegis-muted mt-1 uppercase">
            Packet routing analysis with reroute detection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 text-[10px] font-mono font-bold rounded transition-colors ${
              autoRefresh
                ? 'bg-aegis-accent text-[#003919] animate-pulse'
                : 'text-aegis-muted bg-aegis-bg hover:text-aegis-text'
            }`}
          >
            {autoRefresh ? 'LIVE' : 'PAUSED'}
          </button>
          <button
            onClick={fetchTraffic}
            className="px-3 py-1 text-[10px] font-mono text-aegis-muted
              bg-aegis-bg hover:text-aegis-text transition-colors rounded"
          >
            REFRESH
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-aegis-bg rounded-lg border border-aegis-border/10">
        {ALGO_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAlgorithm(opt.value)}
            className={`px-4 py-1.5 text-[10px] font-mono font-bold rounded transition-colors ${
              algorithm === opt.value
                ? 'bg-aegis-accent text-[#003919] shadow-[0_0_10px_rgba(0,255,136,0.2)]'
                : 'text-aegis-muted hover:text-aegis-text hover:bg-aegis-surface'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-aegis-bg p-4 border-l-2 border-aegis-accent">
          <div className="text-[9px] font-mono text-aegis-muted uppercase">Delivery Rate</div>
          <div className={`text-2xl font-mono font-bold ${
            deliveryRate > 90 ? 'text-aegis-accent' : deliveryRate > 70 ? 'text-aegis-warning' : 'text-aegis-danger'
          }`}>
            {deliveryRate}%
          </div>
        </div>
        <div className="bg-aegis-bg p-4 border-l-2 border-[#3B82F6]">
          <div className="text-[9px] font-mono text-aegis-muted uppercase">Throughput</div>
          <div className="text-2xl font-mono font-bold text-aegis-text">
            {traffic.throughput_mbps}
          </div>
          <div className="text-[8px] font-mono text-aegis-muted">Mbps</div>
        </div>
        <div className="bg-aegis-bg p-4 border-l-2 border-aegis-warning">
          <div className="text-[9px] font-mono text-aegis-muted uppercase">Rerouted</div>
          <div className="text-2xl font-mono font-bold text-aegis-warning">
            {traffic.total_rerouted}
          </div>
        </div>
        <div className="bg-aegis-bg p-4 border-l-2 border-aegis-danger">
          <div className="text-[9px] font-mono text-aegis-muted uppercase">Avg Latency</div>
          <div className="text-2xl font-mono font-bold text-aegis-text">
            {traffic.avg_latency_ms}
          </div>
          <div className="text-[8px] font-mono text-aegis-muted">ms</div>
        </div>
      </div>

      <div className="bg-aegis-bg border border-aegis-border/30 p-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />
            <Tooltip
              contentStyle={{
                background: '#111827',
                border: '1px solid #1F2937',
                fontSize: 11,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#0A0E1A] border border-[#313442]/50 p-4 font-mono text-[10px]
        max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#313442 #0a0e1a' }}>
        <div className="text-aegis-muted mb-2 uppercase tracking-widest text-[9px]">
          Recent Packets ({traffic.packets.length})
        </div>
        {traffic.packets.slice(-20).reverse().map((pkt) => (
          <div key={pkt.id} className="flex items-center gap-2 py-0.5">
            <span className="text-white w-20">[{pkt.id}]</span>
            <span className="text-aegis-muted w-12">{pkt.source_node}</span>
            <span className="text-aegis-muted">-&gt;</span>
            <span className="text-aegis-muted w-12">{pkt.destination_node}</span>
            <span className="flex-1 text-aegis-muted">
              {pkt.route.length > 0 ? `route[${pkt.route.length}]` : 'no-route'}
            </span>
            <span
              className="w-16 text-right font-bold"
              style={{ color: STATUS_COLORS[pkt.status] }}
            >
              {pkt.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
