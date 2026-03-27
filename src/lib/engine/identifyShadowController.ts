import type { NodeRecord, SystemLog, ShadowControllerResult } from '@/types';
import { decodeSerial } from '@/lib/engine/decodeSerials';

export function identifyShadowController(
  nodes: NodeRecord[],
  logs: SystemLog[]
): ShadowControllerResult
{
  const infectedIds = new Set<number>();
  for (const node of nodes)
  {
    if (node.is_infected)
    {
      infectedIds.add(node.node_uuid);
    }
  }
  const countMap = new Map<number, number>();
  for (const log of logs)
  {
    if (infectedIds.has(log.node_id) && log.http_response_code === 429)
    {
      countMap.set(log.node_id, (countMap.get(log.node_id) || 0) + 1);
    }
  }
  let maxNodeId = -1;
  let maxCount = 0;
  for (const [nodeId, count] of countMap.entries())
  {
    if (count > maxCount)
    {
      maxCount = count;
      maxNodeId = nodeId;
    }
  }
  const node = nodes.find((n) => n.node_uuid === maxNodeId);
  const serial = node ? decodeSerial(node.user_agent).decoded : 'UNKNOWN';
  return {
    node_id: maxNodeId,
    decoded_serial: serial,
    infected_429_count: maxCount,
  };
}
