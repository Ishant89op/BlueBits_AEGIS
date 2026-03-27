'use client';

import ThemeToggle from '@/components/layout/ThemeToggle';

export default function Navbar()
{
  return (
    <header className="fixed top-0 right-0 left-20 h-16 flex justify-between
      items-center px-6 z-50 bg-aegis-bg/80 backdrop-blur-xl
      shadow-[0_4px_30px_rgba(0,255,136,0.05)]">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-black tracking-tighter text-aegis-accent
          [text-shadow:0_0_8px_rgba(0,255,136,0.4)]">
          NEXUS CITY CONTROL
        </h1>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-aegis-accent/10 border border-aegis-accent/30
            text-aegis-accent font-mono text-[10px] tracking-widest">
            SCHEMA v1/v2
          </span>
          <span className="text-aegis-muted font-mono text-[10px]">
            AEGIS_ACTIVE
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-aegis-surface
          rounded-lg border border-aegis-border/20">
          <span className="w-2 h-2 rounded-full bg-aegis-accent animate-pulse" />
          <span className="text-[10px] font-mono text-aegis-text">
            SYSTEM_NOMINAL
          </span>
        </div>
        <div className="flex items-center gap-4 text-aegis-muted">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
