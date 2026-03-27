'use client';

import type { ClassifiedNode } from '@/types';
import Badge from '@/components/ui/Badge';

interface NodeTooltipProps
{
  node: ClassifiedNode;
  position: { x: number; y: number };
}

export default function NodeTooltip({ node, position }: NodeTooltipProps)
{
  return (
    <div
      className="fixed z-[60] w-52 p-3 bg-[#262a37] border border-aegis-accent/30
        backdrop-blur-xl shadow-2xl pointer-events-none"
      style={{
        left: position.x + 12,
        top: position.y - 10,
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono text-[10px] text-aegis-accent">
          NODE_ID: {node.node_uuid}
        </span>
        <Badge status={node.true_status} size="sm" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-[9px] uppercase text-aegis-muted">Serial</span>
          <span className="font-mono text-[9px] text-aegis-text">
            {node.decoded_serial}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] uppercase text-aegis-muted">HTTP Code</span>
          <span className="font-mono text-[9px] text-aegis-accent">
            {node.dominant_http_code}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] uppercase text-aegis-muted">Avg Latency</span>
          <span className="font-mono text-[9px] text-aegis-text">
            {node.mean_response_ms}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] uppercase text-aegis-muted">Infected</span>
          <span className={`font-mono text-[9px] ${
            node.is_infected ? 'text-aegis-danger' : 'text-aegis-accent'
          }`}>
            {node.is_infected ? 'TRUE' : 'FALSE'}
          </span>
        </div>
      </div>
    </div>
  );
}
