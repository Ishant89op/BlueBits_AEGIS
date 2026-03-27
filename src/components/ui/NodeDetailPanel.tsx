'use client';

import type { ClassifiedNode } from '@/types';
import Badge from '@/components/ui/Badge';

interface NodeDetailPanelProps
{
  node: ClassifiedNode | null;
  onClose: () => void;
}

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps)
{
  if (!node) return null;
  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 z-50 bg-aegis-surface border-l
      border-aegis-border shadow-2xl overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black tracking-[0.2em] text-aegis-accent">
            NODE DETAIL
          </h3>
          <button
            onClick={onClose}
            className="text-aegis-muted hover:text-aegis-text transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-aegis-bg p-4 border border-aegis-border">
            <div className="text-[10px] font-mono text-aegis-muted uppercase mb-1">
              Node UUID
            </div>
            <div className="text-lg font-mono font-bold text-aegis-text">
              {node.node_uuid}
            </div>
          </div>
          <div className="bg-aegis-bg p-4 border border-aegis-border">
            <div className="text-[10px] font-mono text-aegis-muted uppercase mb-1">
              Decoded Serial
            </div>
            <div className="text-lg font-mono font-bold text-aegis-accent">
              {node.decoded_serial}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-aegis-bg p-3 border border-aegis-border">
              <div className="text-[9px] font-mono text-aegis-muted uppercase mb-1">
                Status
              </div>
              <Badge status={node.true_status} size="md" />
            </div>
            <div className="flex-1 bg-aegis-bg p-3 border border-aegis-border">
              <div className="text-[9px] font-mono text-aegis-muted uppercase mb-1">
                Infected
              </div>
              <span className={`text-sm font-mono font-bold ${
                node.is_infected ? 'text-aegis-danger' : 'text-aegis-accent'
              }`}>
                {node.is_infected ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono text-aegis-muted uppercase tracking-widest">
              HTTP Distribution
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-aegis-accent">200 OK</span>
                <span className="text-[10px] font-mono text-aegis-text">
                  {node.http_200_count}
                </span>
              </div>
              <div className="w-full bg-aegis-bg h-1.5">
                <div
                  className="bg-aegis-accent h-full"
                  style={{
                    width: node.log_count
                      ? `${(node.http_200_count / node.log_count) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-aegis-danger">206 HIJACK</span>
                <span className="text-[10px] font-mono text-aegis-text">
                  {node.http_206_count}
                </span>
              </div>
              <div className="w-full bg-aegis-bg h-1.5">
                <div
                  className="bg-aegis-danger h-full"
                  style={{
                    width: node.log_count
                      ? `${(node.http_206_count / node.log_count) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-aegis-warning">429 DDOS</span>
                <span className="text-[10px] font-mono text-aegis-text">
                  {node.http_429_count}
                </span>
              </div>
              <div className="w-full bg-aegis-bg h-1.5">
                <div
                  className="bg-aegis-warning h-full"
                  style={{
                    width: node.log_count
                      ? `${(node.http_429_count / node.log_count) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
          <div className="bg-aegis-bg p-4 border border-aegis-border">
            <div className="text-[10px] font-mono text-aegis-muted uppercase mb-1">
              Mean Response Time
            </div>
            <div className={`text-xl font-mono font-bold ${
              node.mean_response_ms > 180
                ? 'text-aegis-danger'
                : node.mean_response_ms > 150
                  ? 'text-aegis-warning'
                  : 'text-aegis-accent'
            }`}>
              {node.mean_response_ms}ms
            </div>
          </div>
          <div className="bg-aegis-bg p-4 border border-aegis-border">
            <div className="text-[10px] font-mono text-aegis-muted uppercase mb-1">
              Total Log Entries
            </div>
            <div className="text-xl font-mono font-bold text-aegis-text">
              {node.log_count}
            </div>
          </div>
          <div className="bg-aegis-bg p-4 border border-aegis-border">
            <div className="text-[10px] font-mono text-aegis-muted uppercase mb-1">
              Encoded Serial
            </div>
            <div className="text-xs font-mono text-aegis-muted break-all">
              {node.encoded_serial}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
