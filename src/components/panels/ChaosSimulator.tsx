'use client';

import { useEffect, useState, useCallback } from 'react';
import type {
  ChaosSimulationState,
  ChaosEventType,
} from '@/types/resilience';

const EVENT_TYPES: { value: ChaosEventType; label: string; icon: string; color: string }[] = [
  { value: 'ddos', label: 'DDoS Flood', icon: 'bolt', color: '#FACC15' },
  { value: 'shutdown', label: 'Node Shutdown', icon: 'power_settings_new', color: '#EF4444' },
  { value: 'corruption', label: 'Packet Corruption', icon: 'bug_report', color: '#F97316' },
  { value: 'latency-spike', label: 'Latency Spike', icon: 'speed', color: '#8B5CF6' },
];

export default function ChaosSimulator()
{
  const [state, setState] = useState<ChaosSimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ChaosEventType>('ddos');
  const [severity, setSeverity] = useState(5);
  const [triggering, setTriggering] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);

  const fetchState = useCallback(() =>
  {
    fetch('/api/resilience/chaos')
      .then((r) => r.json())
      .then((data: ChaosSimulationState) =>
      {
        setState(data);
        setLoading(false);
      });
  }, []);

  useEffect(() =>
  {
    fetchState();
  }, [fetchState]);

  const triggerEvent = useCallback(() =>
  {
    setTriggering(true);
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setEventLog((prev) => [
      `[${timestamp}] INJECTING ${selectedType.toUpperCase()} - severity ${severity}`,
      ...prev,
    ]);
    fetch('/api/resilience/chaos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: selectedType,
        severity,
      }),
    })
      .then((r) => r.json())
      .then((data: ChaosSimulationState) =>
      {
        setState(data);
        const ts2 = new Date().toISOString().replace('T', ' ').slice(0, 19);
        setEventLog((prev) => [
          `[${ts2}] RESULT: ${data.affected_nodes.length} nodes affected - resilience ${data.resilience_score}%`,
          ...prev,
        ]);
        setTriggering(false);
      })
      .catch(() =>
      {
        setTriggering(false);
      });
  }, [selectedType, severity]);

  if (loading || !state)
  {
    return (
      <div className="bg-aegis-surface border border-aegis-border/10 p-6
        flex items-center justify-center min-h-[400px]">
        <div className="text-aegis-accent font-mono text-sm animate-pulse">
          INITIALIZING CHAOS ENGINE...
        </div>
      </div>
    );
  }

  const scoreColor = state.resilience_score > 70
    ? '#00FF88'
    : state.resilience_score > 40
      ? '#FACC15'
      : '#EF4444';

  return (
    <div className="bg-aegis-surface border border-aegis-border/10 p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xs font-black tracking-[0.2em] text-aegis-accent">
            CHAOS FAILURE SIMULATION PANEL
          </h2>
          <p className="text-[10px] font-mono text-aegis-muted mt-1 uppercase">
            Test system durability under multi-vector attacks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              state.is_running ? 'bg-aegis-danger animate-pulse' : 'bg-aegis-accent'
            }`}
          />
          <span className="text-[10px] font-mono text-aegis-muted">
            {state.is_running ? 'CHAOS_ACTIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      <div className="bg-aegis-bg p-6 border border-aegis-border/30 flex flex-col items-center gap-4">
        <div className="text-[9px] font-mono text-aegis-muted uppercase tracking-widest">
          Resilience Score
        </div>
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="#1F2937"
              strokeWidth="6"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${state.resilience_score * 2.64} 264`}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-2xl font-mono font-black"
              style={{ color: scoreColor }}
            >
              {state.resilience_score}
            </span>
            <span className="text-[8px] font-mono text-aegis-muted">SCORE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {EVENT_TYPES.map((et) => (
          <button
            key={et.value}
            onClick={() => setSelectedType(et.value)}
            className={`p-4 flex items-center gap-3 transition-all ${
              selectedType === et.value
                ? 'bg-aegis-bg border-2'
                : 'bg-aegis-bg/50 border border-aegis-border/10 hover:border-aegis-border/30'
            }`}
            style={{
              borderColor: selectedType === et.value ? et.color : undefined,
            }}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{
                color: et.color,
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {et.icon}
            </span>
            <div className="text-left">
              <div className="text-[10px] font-mono font-bold text-aegis-text">
                {et.label}
              </div>
              <div className="text-[8px] font-mono text-aegis-muted uppercase">
                {et.value}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-[9px] font-mono text-aegis-muted uppercase">
              Severity
            </span>
            <span className="text-[9px] font-mono text-aegis-text">
              {severity}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={severity}
            onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-aegis-bg rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-aegis-accent [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
        <button
          onClick={triggerEvent}
          disabled={triggering}
          className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest
            transition-all ${
            triggering
              ? 'bg-aegis-danger/50 text-white cursor-wait'
              : 'bg-aegis-danger text-white hover:bg-aegis-danger/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
          }`}
        >
          {triggering ? 'INJECTING...' : 'INJECT FAILURE'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-aegis-bg p-3 border border-aegis-border/10">
          <div className="text-[8px] font-mono text-aegis-muted uppercase">Affected</div>
          <div className="text-lg font-mono font-bold text-aegis-warning">
            {state.affected_nodes.length}
          </div>
        </div>
        <div className="bg-aegis-bg p-3 border border-aegis-border/10">
          <div className="text-[8px] font-mono text-aegis-muted uppercase">Recovered</div>
          <div className="text-lg font-mono font-bold text-aegis-accent">
            {state.nodes_recovered.length}
          </div>
        </div>
        <div className="bg-aegis-bg p-3 border border-aegis-border/10">
          <div className="text-[8px] font-mono text-aegis-muted uppercase">Events</div>
          <div className="text-lg font-mono font-bold text-aegis-text">
            {state.events.length}
          </div>
        </div>
      </div>

      <div className="bg-[#0A0E1A] border border-[#313442]/50 p-4 font-mono text-[10px]
        max-h-36 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#313442 #0a0e1a' }}>
        <div className="text-aegis-muted mb-2 uppercase tracking-widest text-[9px]">
          Chaos Event Log
        </div>
        {eventLog.length === 0 && (
          <div className="text-aegis-muted">No events triggered yet. Click INJECT FAILURE to begin.</div>
        )}
        {eventLog.map((line, i) => (
          <div
            key={i}
            className={`py-0.5 ${
              line.includes('INJECTING')
                ? 'text-aegis-danger'
                : line.includes('RESULT')
                  ? 'text-aegis-accent'
                  : 'text-aegis-muted'
            }`}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
