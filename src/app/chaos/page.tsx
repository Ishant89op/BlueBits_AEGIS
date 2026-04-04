'use client';

import ChaosSimulator from '@/components/panels/ChaosSimulator';
import LoadBalancerStatus from '@/components/panels/LoadBalancerStatus';

export default function ChaosPage()
{
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-aegis-border/20 pb-4">
        <h1 className="text-2xl font-black tracking-tighter text-aegis-text
          font-headline uppercase">
          CHAOS ENGINEERING LAB
        </h1>
        <p className="text-[10px] font-mono text-aegis-muted mt-1 uppercase tracking-wider">
          Inject failures to test network resilience and self-healing capabilities
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChaosSimulator />
        <LoadBalancerStatus />
      </div>
    </div>
  );
}
