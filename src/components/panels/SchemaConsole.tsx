'use client';

import { useEffect, useState, useRef } from 'react';
import type { SchemaVersion, SchemaLogEntry } from '@/types';
import StatCard from '@/components/ui/StatCard';

interface SchemaResponse
{
  versions: SchemaVersion[];
  event_log: SchemaLogEntry[];
}

export default function SchemaConsole()
{
  const [data, setData] = useState<SchemaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  useEffect(() =>
  {
    fetch('/api/schema')
      .then((r) => r.json())
      .then((d: SchemaResponse) =>
      {
        setData(d);
        setLoading(false);
      });
  }, []);
  useEffect(() =>
  {
    if (terminalRef.current)
    {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [data]);
  if (loading || !data)
  {
    return (
      <div className="bg-aegis-surface border border-aegis-border/10 p-6
        flex items-center justify-center min-h-[400px]">
        <div className="text-aegis-accent font-mono text-sm animate-pulse">
          LOADING SCHEMA DATA...
        </div>
      </div>
    );
  }
  const currentVersion = data.versions[data.versions.length - 1];
  const rotationEvents = data.event_log.filter((e) => e.is_rotation_event);
  const displayEntries = data.event_log.filter(
    (_, i) => i % 50 === 0 || data.event_log[i].is_rotation_event
  );
  return (
    <div className="bg-aegis-surface border border-aegis-border/10 p-6
      flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-black tracking-[0.2em] text-aegis-accent">
          DYNAMIC SCHEMA CONSOLE
        </h2>
        <span className="px-2 py-0.5 bg-aegis-accent text-[#003919]
          font-mono text-[9px] font-bold">
          LIVE FEED
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Schema Version"
          value={`v${currentVersion.version}`}
          icon="schema"
          borderColor="border-aegis-accent"
          valueColor="text-aegis-accent"
        />
        <StatCard
          title="Active Column"
          value={currentVersion.active_column}
          icon="view_column"
          borderColor="border-aegis-warning"
          valueColor="text-aegis-warning"
        />
      </div>
      <div className="relative h-6 bg-aegis-bg border border-aegis-border/30 flex">
        <div className="w-1/2 bg-aegis-accent/20 flex items-center justify-center
          border-r border-aegis-border/30">
          <span className="text-[8px] font-mono text-aegis-accent">
            v1 (0-4999) load_val
          </span>
        </div>
        <div className="w-1/2 bg-aegis-warning/20 flex items-center justify-center">
          <span className="text-[8px] font-mono text-aegis-warning">
            v2 (5000-9999) L_V1
          </span>
        </div>
      </div>
      <div
        ref={terminalRef}
        className="bg-[#0A0E1A] border border-[#313442]/50 p-4 font-mono
          text-[11px] h-64 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#313442 #0a0e1a',
        }}
      >
        {displayEntries.map((entry) => (
          <p
            key={entry.log_id}
            className={`mb-0.5 ${
              entry.is_rotation_event
                ? 'text-amber-500 font-bold'
                : 'text-[#00FF88]/70'
            }`}
          >
            <span className="text-white">
              [{String(entry.log_id).padStart(5, '0')}]
            </span>
            {entry.is_rotation_event
              ? ` ROTATION: Schema v${entry.version} activated ` +
                `| column=${entry.active_column}`
              : ` v${entry.version} | ${entry.active_column}=` +
                `${entry.value !== null ? entry.value.toFixed(4) : 'NULL'}`
            }
          </p>
        ))}
        <p className="text-[#00FF88] animate-pulse mt-1">
          _ {rotationEvents.length} schema rotation events detected
        </p>
      </div>
    </div>
  );
}
