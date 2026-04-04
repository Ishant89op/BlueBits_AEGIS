'use client';

import NetworkTopology from '@/components/panels/NetworkTopology';
import TrafficFlow from '@/components/panels/TrafficFlow';
import ChaosSimulator from '@/components/panels/ChaosSimulator';
import LoadBalancerStatus from '@/components/panels/LoadBalancerStatus';

export default function ResiliencePage()
{
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-aegis-border/20 pb-4">
        <h1 className="text-2xl font-black tracking-tighter text-aegis-text
          font-headline uppercase">
          RESILIENCE COMMAND CENTER
        </h1>
        <p className="text-[10px] font-mono text-aegis-muted mt-1 uppercase tracking-wider">
          Self-healing network defense - load balancing - chaos simulation
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <NetworkTopology />
        </div>
        <div>
          <LoadBalancerStatus />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficFlow />
        <ChaosSimulator />
      </div>
    </div>
  );
}
