'use client';

import { useEffect, useState, useCallback } from 'react';
import { HttpStatus } from '@/types';
import type { ClassifiedNode } from '@/types';
import NodeTooltip from '@/components/ui/NodeTooltip';
import NodeDetailPanel from '@/components/ui/NodeDetailPanel';

type FilterType = 'ALL' | 'DDOS' | 'HIJACKED' | 'CLEAN';

const statusColorMap: Record<HttpStatus, string> = {
  [HttpStatus.OPERATIONAL]: 'bg-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.4)]',
  [HttpStatus.HIJACKED]: 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]',
  [HttpStatus.DDOS]: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
  [HttpStatus.UNKNOWN]: 'bg-slate-700',
};

export default function CityMap()
{
  const [nodes, setNodes] = useState<ClassifiedNode[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [hoveredNode, setHoveredNode] = useState<ClassifiedNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<ClassifiedNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadNodes = () =>
  {
    setLoading(true);
    setError(null);
    fetch('/api/nodes')
      .then((res) => res.json())
      .then((data: ClassifiedNode[]) =>
      {
        setNodes(data);
        setLoading(false);
      })
      .catch(() =>
      {
        setError('Failed to load node data');
        setLoading(false);
      });
  };
  useEffect(() => { loadNodes(); }, []);
  const filteredNodes = useCallback(() =>
  {
    if (filter === 'ALL') return nodes;
    if (filter === 'DDOS') return nodes.filter((n) => n.true_status === HttpStatus.DDOS);
    if (filter === 'HIJACKED') return nodes.filter((n) => n.true_status === HttpStatus.HIJACKED);
    if (filter === 'CLEAN') return nodes.filter((n) => n.true_status === HttpStatus.OPERATIONAL);
    return nodes;
  }, [nodes, filter]);
  const handleMouseEnter = (
    node: ClassifiedNode,
    e: React.MouseEvent
  ) =>
  {
    setHoveredNode(node);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) =>
  {
    if (hoveredNode)
    {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };
  if (loading)
  {
    return (
      <div className="bg-aegis-surface border border-aegis-border/10 p-6
        flex items-center justify-center min-h-[400px]">
        <div className="text-aegis-accent font-mono text-sm animate-pulse">
          LOADING NODE GRID...
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
          onClick={loadNodes}
          className="px-4 py-2 bg-aegis-danger/10 border border-aegis-danger/30
            text-aegis-danger font-mono text-xs hover:bg-aegis-danger/20"
        >
          RETRY
        </button>
      </div>
    );
  }
  const displayed = filteredNodes();
  return (
    <div className="bg-aegis-surface border border-aegis-border/10 p-6
      flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xs font-black tracking-[0.2em] text-aegis-accent">
            FORENSIC CITY MAP - NODE STATUS BY HTTP CODE
          </h2>
          <p className="text-[10px] font-mono text-aegis-muted mt-1 uppercase">
            JSON status ignored - truth derived from HTTP response codes
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-aegis-bg rounded-lg
          border border-aegis-border/10">
          {(['ALL', 'DDOS', 'HIJACKED', 'CLEAN'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-mono font-bold rounded
                transition-colors ${
                filter === f
                  ? 'bg-aegis-accent text-[#003919] shadow-[0_0_10px_rgba(0,255,136,0.2)]'
                  : 'text-aegis-muted hover:text-aegis-text hover:bg-aegis-surface'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div
        className="bg-aegis-bg border border-aegis-border/30 relative overflow-auto
          min-h-[350px] p-4"
        onMouseMove={handleMouseMove}
      >
        <div className="grid grid-cols-25 gap-1 mx-auto max-w-4xl">
          {displayed.map((node) => (
            <div
              key={node.node_uuid}
              className="relative w-4 h-4 flex items-center justify-center
                cursor-pointer group/node"
              onMouseEnter={(e) => handleMouseEnter(node, e)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(node)}
            >
              {node.is_infected && (
                <div className="absolute inset-0 rounded-full border
                  border-aegis-danger animate-ping opacity-20" />
              )}
              <div className={`w-2.5 h-2.5 rounded-full transition-transform
                group-hover/node:scale-150
                ${statusColorMap[node.true_status]}`}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 flex flex-col gap-2
          bg-aegis-surface/80 backdrop-blur p-3 border border-aegis-border/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
            <span className="text-[9px] font-mono text-aegis-text">200 OK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[9px] font-mono text-aegis-text">429 DDOS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-[9px] font-mono text-aegis-text">206 HIJACKED</span>
          </div>
        </div>
      </div>
      {hoveredNode && (
        <NodeTooltip node={hoveredNode} position={tooltipPos} />
      )}
      <NodeDetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
