'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: 'dashboard', label: 'Overview' },
  { href: '/city-map', icon: 'map', label: 'City Map' },
  { href: '/sleeper', icon: 'hub', label: 'Sleeper' },
  { href: '/schema', icon: 'terminal', label: 'Schema' },
  { href: '/registry', icon: 'inventory_2', label: 'Registry' },
  { href: '/threat-report', icon: 'security', label: 'Threats' },
];

export default function Sidebar()
{
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col z-40
      bg-[#111827] dark:bg-[#111827] w-20 border-r border-[#313442]/20
      shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.05)]">
      <div className="p-4 flex flex-col items-center gap-1 mb-8">
        <span className="text-[#00FF88] font-bold tracking-widest text-xs font-mono">
          AEGIS
        </span>
        <span className="text-[8px] text-slate-500 font-mono tracking-tighter">
          NEXUS CITY
        </span>
      </div>
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map((item) =>
        {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                w-full h-12 flex flex-col items-center justify-center
                transition-colors
                ${isActive
                  ? 'text-[#00FF88] bg-[#00FF88]/10 border-l-4 border-[#00FF88]'
                  : 'text-slate-500 hover:text-[#00FF88]/70 hover:bg-[#313442]/30'
                }
              `}
              title={item.label}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={isActive
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
                }
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="pb-6 flex flex-col items-center">
        <div className="w-12 h-12 flex items-center justify-center
          text-slate-500">
          <span className="material-symbols-outlined text-2xl">
            shield
          </span>
        </div>
      </div>
    </aside>
  );
}
