import type { SystemLog, SleeperReport } from '@/types';
import { decodeSerial } from '@/lib/engine/decodeSerials';
import type { NodeRecord } from '@/types';

export function detectSleepers(
  logs: SystemLog[],
  nodes: NodeRecord[]
): SleeperReport[]
{
  const nodeMap = new Map<number, { total: number; count: number }>();
  for (const log of logs)
  {
    const entry = nodeMap.get(log.node_id);
    if (entry)
    {
      entry.total += log.response_time_ms;
      entry.count += 1;
    }
    else
    {
      nodeMap.set(log.node_id, {
        total: log.response_time_ms,
        count: 1,
      });
    }
  }
  const serialMap = new Map<number, string>();
  for (const node of nodes)
  {
    const { decoded } = decodeSerial(node.user_agent);
    serialMap.set(node.node_uuid, decoded);
  }
  const reports: SleeperReport[] = [];
  for (const [nodeId, entry] of Array.from(nodeMap.entries()))
  {
    const mean = entry.total / entry.count;
    reports.push({
      node_id: nodeId,
      decoded_serial: serialMap.get(nodeId) || 'UNKNOWN',
      mean_response_ms: Math.round(mean * 100) / 100,
      is_sleeper: mean > 180,
      log_count: entry.count,
    });
  }
  reports.sort((a, b) => b.mean_response_ms - a.mean_response_ms);
  return reports;
}
