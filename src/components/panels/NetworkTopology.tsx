'use client';

import { useEffect, useState, useCallback } from 'react';
import type { NetworkTopologyData, TopologyNode } from '@/types/resilience';

const HEALTH_COLORS: Record<string, string> = {
  healthy: '#00FF88',
  degraded: '#FACC15',
  failed: '#EF4444',
  recovering: '#3B82F6',
};

export default function NetworkTopology()
{
  const [topology, setTopology] = useState<NetworkTopologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<TopologyNode | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const fetchTopology = useCallback(() =>
  {
    fetch('/api/resilience/topology')
      .then((r) => r.json())
      .then((data: NetworkTopologyData) =>
      {
        setTopology(data);
        setLoading(false);
      });
  }, []);

  useEffect(() =>
  {
    fetchTopology();
  }, [fetchTopology]);

  if (loading || !topology)
  {
    return (
      <div className="bg-aegis-surface border border-aegis-border/10 p-6
        flex items-center justify-center min-h-[500px]">
        <div className="text-aegis-accent font-mono text-sm animate-pulse">
          BUILDING NETWORK TOPOLOGY...
        </div>
      </div>
    );
  }

  const filteredNodes = selectedCluster !== null
    ? topology.nodes.filter((n) => n.cluster_id === selectedCluster)
    : topology.nodes;

  const filteredEdges = topology.edges.filter((e) =>
  {
    if (selectedCluster === null) return true;
    const sourceNode = topology.nodes.find((n) => n.id === e.source);
    const targetNode = topology.nodes.find((n) => n.id === e.target);
    return (
      (sourceNode?.cluster_id === selectedCluster) ||
      (targetNode?.cluster_id === selectedCluster)
    );
  });

  const healthCounts = {
    healthy: topology.nodes.filter((n) => n.health === 'healthy').length,
    degraded: topology.nodes.filter((n) => n.health === 'degraded').length,
    failed: topology.nodes.filter((n) => n.health === 'failed').length,
    recovering: topology.nodes.filter((n) => n.health === 'recovering').length,
  };

  return (
    <div className="bg-aegis-surface border border-aegis-border/10 p-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xs font-black tracking-[0.2em] text-aegis-accent">
            LIVE NETWORK TOPOLOGY MAP
          </h2>
          <p className="text-[10px] font-mono text-aegis-muted mt-1 uppercase">
            {topology.nodes.length} nodes - {topology.edges.length} edges - {topology.clusters.length} clusters
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {Object.entries(healthCounts).map(([key, count]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: HEALTH_COLORS[key] }}
                />
                <span className="text-[9px] font-mono text-aegis-muted uppercase">
                  {key}: {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCluster(null)}
          className={`px-3 py-1 text-[10px] font-mono font-bold rounded transition-colors ${
            selectedCluster === null
              ? 'bg-aegis-accent text-[#003919]'
              : 'text-aegis-muted hover:text-aegis-text bg-aegis-bg'
          }`}
        >
          ALL
        </button>
        {topology.clusters.map((cluster) => (
          <button
            key={cluster.id}
            onClick={() => setSelectedCluster(cluster.id)}
            className={`px-3 py-1 text-[10px] font-mono font-bold rounded transition-colors flex items-center gap-1.5 ${
              selectedCluster === cluster.id
                ? 'bg-aegis-accent text-[#003919]'
                : 'text-aegis-muted hover:text-aegis-text bg-aegis-bg'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: cluster.color }}
            />
            {cluster.name}
          </button>
        ))}
      </div>

      <div className="bg-[#060A14] border border-aegis-border/30 relative overflow-hidden"
        style={{ height: '520px' }}>
        <svg width="100%" height="100%" viewBox="0 0 1100 520">
          {filteredEdges.map((edge, i) =>
          {
            const source = topology.nodes.find((n) => n.id === edge.source);
            const target = topology.nodes.find((n) => n.id === edge.target);
            if (!source || !target) return null;
            return (
              <line
                key={`edge-${i}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={edge.is_active ? '#1F2937' : '#EF4444'}
                strokeWidth={edge.is_active ? 0.5 : 1}
                strokeDasharray={edge.is_active ? undefined : '4 2'}
                opacity={edge.is_active ? 0.4 : 0.6}
              />
            );
          })}

          {filteredNodes.map((node) =>
          {
            const clusterInfo = topology.clusters.find(
              (c) => c.id === node.cluster_id
            );
            return (
              <g key={node.id}>
                {node.is_gateway && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={8}
                    fill="none"
                    stroke={HEALTH_COLORS[node.health]}
                    strokeWidth={0.5}
                    opacity={0.3}
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.is_gateway ? 5 : 3}
                  fill={HEALTH_COLORS[node.health]}
                  opacity={node.health === 'failed' ? 0.5 : 0.9}
                  className="cursor-pointer transition-all hover:opacity-100"
                  onMouseEnter={(e) =>
                  {
                    setHoveredNode(node);
                    setTooltipPos({
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                  onMouseMove={(e) =>
                  {
                    if (hoveredNode?.id === node.id)
                    {
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }
                  }}
                />
                {node.is_gateway && clusterInfo && (
                  <text
                    x={node.x}
                    y={node.y - 12}
                    textAnchor="middle"
                    fill={clusterInfo.color}
                    fontSize="7"
                    fontFamily="JetBrains Mono"
                    opacity={0.7}
                  >
                    {clusterInfo.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredNode && (
        <div
          className="fixed z-[60] w-56 p-3 bg-[#262a37] border border-aegis-accent/30
            backdrop-blur-xl shadow-2xl pointer-events-none"
          style={{
            left: tooltipPos.x + 14,
            top: tooltipPos.y - 10,
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-mono text-[10px] text-aegis-accent">
              NODE {hoveredNode.id}
            </span>
            <span
              className="text-[8px] font-mono font-bold px-1.5 py-0.5"
              style={{
                color: HEALTH_COLORS[hoveredNode.health],
                backgroundColor: `${HEALTH_COLORS[hoveredNode.health]}15`,
              }}
            >
              {hoveredNode.health.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1 text-[9px] font-mono">
            <div className="flex justify-between">
              <span className="text-aegis-muted">Serial</span>
              <span className="text-aegis-text">{hoveredNode.serial}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-aegis-muted">Latency</span>
              <span className="text-aegis-text">{Math.round(hoveredNode.latency_ms)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-aegis-muted">Throughput</span>
              <span className="text-aegis-text">{hoveredNode.throughput_mbps} Mbps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-aegis-muted">Packet Loss</span>
              <span className={hoveredNode.packet_loss_pct > 20 ? 'text-aegis-danger' : 'text-aegis-text'}>
                {hoveredNode.packet_loss_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-aegis-muted">Weight</span>
              <span className="text-aegis-text">{hoveredNode.weight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-aegis-muted">Cluster</span>
              <span className="text-aegis-text">
                {topology.clusters.find((c) => c.id === hoveredNode.cluster_id)?.name}
              </span>
            </div>
            {hoveredNode.is_gateway && (
              <div className="text-aegis-accent text-center mt-1 border-t border-aegis-border/30 pt-1">
                GATEWAY NODE
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {topology.clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-aegis-bg p-3 border-l-2 cursor-pointer hover:brightness-110 transition-colors"
            style={{ borderLeftColor: cluster.color }}
            onClick={() => setSelectedCluster(
              selectedCluster === cluster.id ? null : cluster.id
            )}
          >
            <div className="text-[9px] font-mono text-aegis-muted uppercase">
              {cluster.name}
            </div>
            <div className="text-sm font-mono font-bold text-aegis-text">
              {cluster.healthy_count}/{cluster.node_count}
            </div>
            <div className="text-[8px] font-mono text-aegis-muted">
              HEALTHY
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
