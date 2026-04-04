import { NextResponse } from 'next/server';
import { getNodeRegistry, getSystemLogs } from '@/lib/cache/dataCache';
import { classifyHttpStatus } from '@/lib/engine/classifyHttpStatus';
import { decodeSerial } from '@/lib/engine/decodeSerials';
import { buildTopology } from '@/lib/engine/networkTopology';
import type { ClassifiedNode } from '@/types';
import type { NetworkTopologyData } from '@/types/resilience';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<NetworkTopologyData>>
{
  const nodes = getNodeRegistry();
  const logs = getSystemLogs();
  const nodeLogMap = new Map<number, {
    total_ms: number;
    count: number;
    http_200: number;
    http_206: number;
    http_429: number;
  }>();
  for (const log of logs)
  {
    const entry = nodeLogMap.get(log.node_id);
    if (entry)
    {
      entry.total_ms += log.response_time_ms;
      entry.count += 1;
      if (log.http_response_code === 200) entry.http_200 += 1;
      else if (log.http_response_code === 206) entry.http_206 += 1;
      else if (log.http_response_code === 429) entry.http_429 += 1;
    }
    else
    {
      nodeLogMap.set(log.node_id, {
        total_ms: log.response_time_ms,
        count: 1,
        http_200: log.http_response_code === 200 ? 1 : 0,
        http_206: log.http_response_code === 206 ? 1 : 0,
        http_429: log.http_response_code === 429 ? 1 : 0,
      });
    }
  }
  const classified: ClassifiedNode[] = nodes.map((node) =>
  {
    const { encoded, decoded } = decodeSerial(node.user_agent);
    const stats = nodeLogMap.get(node.node_uuid);
    let dominantCode = 200;
    if (stats)
    {
      if (stats.http_429 >= stats.http_206 && stats.http_429 >= stats.http_200)
      {
        dominantCode = 429;
      }
      else if (stats.http_206 >= stats.http_200)
      {
        dominantCode = 206;
      }
    }
    const statusInfo = classifyHttpStatus(dominantCode);
    return {
      node_uuid: node.node_uuid,
      decoded_serial: decoded,
      encoded_serial: encoded,
      is_infected: node.is_infected,
      true_status: statusInfo.status,
      dominant_http_code: dominantCode,
      mean_response_ms: stats
        ? Math.round((stats.total_ms / stats.count) * 100) / 100
        : 0,
      log_count: stats ? stats.count : 0,
      http_200_count: stats ? stats.http_200 : 0,
      http_206_count: stats ? stats.http_206 : 0,
      http_429_count: stats ? stats.http_429 : 0,
    };
  });
  const topology = buildTopology(classified);
  return NextResponse.json(topology);
}
