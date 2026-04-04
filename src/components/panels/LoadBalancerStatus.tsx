'use client';

import { useEffect, useState, useCallback } from 'react';
import type { BalancerState, BalancerAlgorithm } from '@/types/resilience';

const ALGO_DETAILS: Record<BalancerAlgorithm, { name: string; description: string }> = {
  'round-robin': {
    name: 'Round Robin',
    description: 'Distributes requests sequentially across all available nodes in a circular order.',
  },
  'least-latency': {
    name: 'Least Latency',
    description: 'Routes traffic to the node with the lowest current response time.',
  },
  weighted: {
    name: 'Weighted Routing',
    description: 'Assigns traffic proportionally based on node health weight scores.',
  },
};

export default function LoadBalancerStatus()
{
  const [balancer, setBalancer] = useState<BalancerState | null>(null);
  const [algorithm, setAlgorithm] = useState<BalancerAlgorithm>('round-robin');
  const [loading, setLoading] = useState(true);

  const fetchBalancer = useCallback(() =>
  {
    fetch(`/api/resilience/balancer?algorithm=${algorithm}`)
      .then((r) => r.json())
      .then((data: BalancerState) =>
      {
        setBalancer(data);
        setLoading(false);
      });
  }, [algorithm]);

  useEffect(() =>
  {
    fetchBalancer();
  }, [fetchBalancer]);

  if (loading || !balancer)
  {
    return (
      <div className="bg-aegis-surface border border-aegis-border/10 p-6
        flex items-center justify-center min-h-[300px]">
        <div className="text-aegis-accent font-mono text-sm animate-pulse">
          LOADING BALANCER STATE...
        </div>
      </div>
    );
  }

  const activeRatio = balancer.active_nodes.length + balancer.failed_nodes.length > 0
    ? Math.round(
      (balancer.active_nodes.length /
        (balancer.active_nodes.length + balancer.failed_nodes.length)) * 100
    )
    : 0;

  const details = ALGO_DETAILS[algorithm];

  return (
    <div className="bg-aegis-surface border border-aegis-border/10 p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-xs font-black tracking-[0.2em] text-aegis-accent">
          LOAD BALANCER STATUS
        </h2>
        <p className="text-[10px] font-mono text-aegis-muted mt-1 uppercase">
          Algorithm performance and routing metrics
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(['round-robin', 'least-latency', 'weighted'] as BalancerAlgorithm[]).map((algo) => (
          <button
            key={algo}
            onClick={() => setAlgorithm(algo)}
            className={`p-3 text-center transition-all ${
              algorithm === algo
                ? 'bg-aegis-accent/10 border-2 border-aegis-accent'
                : 'bg-aegis-bg border border-aegis-border/10 hover:border-aegis-border/30'
            }`}
          >
            <div className={`text-[10px] font-mono font-bold ${
              algorithm === algo ? 'text-aegis-accent' : 'text-aegis-text'
            }`}>
              {ALGO_DETAILS[algo].name.toUpperCase()}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-aegis-bg p-4 border border-aegis-border/10">
        <div className="text-[9px] font-mono text-aegis-muted uppercase mb-1">
          Active Algorithm
        </div>
        <div className="text-sm font-mono font-bold text-aegis-accent mb-2">
          {details.name}
        </div>
        <div className="text-[10px] text-aegis-muted">
          {details.description}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-aegis-bg p-4 border-l-2 border-aegis-accent">
          <div className="text-[9px] font-mono text-aegis-muted uppercase">Active Nodes</div>
          <div className="text-2xl font-mono font-bold text-aegis-accent">
            {balancer.active_nodes.length}
          </div>
        </div>
        <div className="bg-aegis-bg p-4 border-l-2 border-aegis-danger">
          <div className="text-[9px] font-mono text-aegis-muted uppercase">Failed Nodes</div>
          <div className="text-2xl font-mono font-bold text-aegis-danger">
            {balancer.failed_nodes.length}
          </div>
        </div>
        <div className="bg-aegis-bg p-4 border-l-2 border-aegis-warning">
          <div className="text-[9px] font-mono text-aegis-muted uppercase">Failovers</div>
          <div className="text-2xl font-mono font-bold text-aegis-warning">
            {balancer.failovers_triggered}
          </div>
        </div>
        <div className="bg-aegis-bg p-4 border-l-2 border-[#3B82F6]">
          <div className="text-[9px] font-mono text-aegis-muted uppercase">Avg Latency</div>
          <div className="text-2xl font-mono font-bold text-aegis-text">
            {balancer.avg_route_latency_ms}
          </div>
          <div className="text-[8px] font-mono text-aegis-muted">ms</div>
        </div>
      </div>

      <div className="bg-aegis-bg p-4 border border-aegis-border/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] font-mono text-aegis-muted uppercase">
            Node Availability
          </span>
          <span className={`text-[10px] font-mono font-bold ${
            activeRatio > 80 ? 'text-aegis-accent' : activeRatio > 50 ? 'text-aegis-warning' : 'text-aegis-danger'
          }`}>
            {activeRatio}%
          </span>
        </div>
        <div className="w-full bg-[#1F2937] h-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${activeRatio}%`,
              background: activeRatio > 80
                ? '#00FF88'
                : activeRatio > 50
                  ? '#FACC15'
                  : '#EF4444',
            }}
          />
        </div>
      </div>

      <div className="bg-aegis-bg p-4 border border-aegis-border/10">
        <div className="text-[9px] font-mono text-aegis-muted uppercase mb-1">
          Routes Computed
        </div>
        <div className="text-lg font-mono font-bold text-aegis-text">
          {balancer.routes_computed.toLocaleString()}
        </div>
        <div className="text-[8px] font-mono text-aegis-muted">
          RR Index: {balancer.round_robin_index}
        </div>
      </div>
    </div>
  );
}
