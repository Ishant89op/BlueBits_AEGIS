'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import AlertBanner from '@/components/ui/AlertBanner';
import CityMap from '@/components/panels/CityMap';
import SleeperHeatmap from '@/components/panels/SleeperHeatmap';
import SchemaConsole from '@/components/panels/SchemaConsole';
import AssetRegistry from '@/components/panels/AssetRegistry';
import type { ThreatReport } from '@/types';

export default function HomePage()
{
  const [report, setReport] = useState<ThreatReport | null>(null);
  useEffect(() =>
  {
    fetch('/api/threat-report')
      .then((r) => r.json())
      .then((data: ThreatReport) => setReport(data));
  }, []);
  return (
    <div className="flex flex-col gap-6">
      <AlertBanner
        message={`THREAT DETECTED - ${report?.infected_count ?? '...'} COMPROMISED NODES`}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Nodes"
          value={report?.total_nodes ?? '...'}
          subtitle="CLUSTER: NORTH_1"
          icon="storage"
          borderColor="border-slate-600"
        />
        <StatCard
          title="Compromised"
          value={report?.infected_count ?? '...'}
          subtitle={report
            ? `${((report.infected_count / report.total_nodes) * 100).toFixed(1)}% CRITICAL RATIO`
            : '...'
          }
          icon="security_update_warning"
          borderColor="border-aegis-danger"
          valueColor="text-aegis-danger"
        />
        <StatCard
          title="Under DDoS"
          value={report?.ddos_count ?? '...'}
          subtitle="429_ERR"
          icon="lan"
          borderColor="border-aegis-warning"
          valueColor="text-aegis-warning"
        />
        <StatCard
          title="Clean"
          value={report?.clean_count ?? '...'}
          subtitle="VERIFIED SECURE"
          icon="verified_user"
          borderColor="border-aegis-accent"
          valueColor="text-aegis-accent"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CityMap />
        </div>
        <div className="lg:col-span-2">
          <SleeperHeatmap />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SchemaConsole />
        <AssetRegistry />
      </div>
      <footer className="mt-auto pt-6 flex justify-between items-center
        text-aegis-muted font-mono text-[9px] border-t border-aegis-border/20">
        <div className="flex gap-4">
          <span>ENCRYPTION: AES-256-GCM</span>
          <span>TUNNEL: SECURE</span>
          <span>OPERATOR: 772-X</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="tracking-widest">AEGIS CYBERNETICS DIV. 2025</span>
        </div>
      </footer>
    </div>
  );
}
