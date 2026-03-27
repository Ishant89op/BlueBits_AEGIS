import { NextResponse } from 'next/server';
import { getNodeRegistry, getSystemLogs } from '@/lib/cache/dataCache';
import { classifyHttpStatus } from '@/lib/engine/classifyHttpStatus';
import { detectSleepers } from '@/lib/engine/detectSleepers';
import { identifyShadowController } from '@/lib/engine/identifyShadowController';
import { HttpStatus } from '@/types';
import type { ThreatReport } from '@/types';

export async function GET(): Promise<NextResponse<ThreatReport>>
{
  const nodes = getNodeRegistry();
  const logs = getSystemLogs();
  const infectedCount = nodes.filter((n) => n.is_infected).length;
  const cleanCount = nodes.length - infectedCount;
  const statusCounts: Record<HttpStatus, number> = {
    [HttpStatus.OPERATIONAL]: 0,
    [HttpStatus.HIJACKED]: 0,
    [HttpStatus.DDOS]: 0,
    [HttpStatus.UNKNOWN]: 0,
  };
  const nodeStatusMap = new Map<number, Map<number, number>>();
  for (const log of logs)
  {
    if (!nodeStatusMap.has(log.node_id))
    {
      nodeStatusMap.set(log.node_id, new Map());
    }
    const codeMap = nodeStatusMap.get(log.node_id)!;
    codeMap.set(
      log.http_response_code,
      (codeMap.get(log.http_response_code) || 0) + 1
    );
  }
  const nodesByStatus: Record<HttpStatus, number[]> = {
    [HttpStatus.OPERATIONAL]: [],
    [HttpStatus.HIJACKED]: [],
    [HttpStatus.DDOS]: [],
    [HttpStatus.UNKNOWN]: [],
  };
  for (const [nodeId, codeMap] of nodeStatusMap.entries())
  {
    let dominantCode = 200;
    let maxCount = 0;
    for (const [code, count] of codeMap.entries())
    {
      if (count > maxCount)
      {
        maxCount = count;
        dominantCode = code;
      }
    }
    const info = classifyHttpStatus(dominantCode);
    statusCounts[info.status] += 1;
    nodesByStatus[info.status].push(nodeId);
  }
  const sleepers = detectSleepers(logs, nodes);
  const topSleepers = sleepers.slice(0, 10);
  const shadowController = identifyShadowController(nodes, logs);
  const report: ThreatReport = {
    total_nodes: nodes.length,
    infected_count: infectedCount,
    clean_count: cleanCount,
    ddos_count: statusCounts[HttpStatus.DDOS],
    hijacked_count: statusCounts[HttpStatus.HIJACKED],
    operational_count: statusCounts[HttpStatus.OPERATIONAL],
    sleeper_nodes: topSleepers,
    shadow_controller: shadowController,
    nodes_by_status: nodesByStatus,
  };
  return NextResponse.json(report);
}
