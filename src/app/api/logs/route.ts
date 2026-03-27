import { NextRequest, NextResponse } from 'next/server';
import { getSystemLogs, getSchemaConfig } from '@/lib/cache/dataCache';
import { resolveSchemaForLog, getLoadValue } from '@/lib/engine/resolveSchema';

interface EnrichedLog
{
  log_id: number;
  node_id: number;
  http_response_code: number;
  response_time_ms: number;
  schema_version: number;
  active_column: string;
  load_value: number | null;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<EnrichedLog[]>>
{
  const searchParams = request.nextUrl.searchParams;
  const nodeIdParam = searchParams.get('node_id');
  const limitParam = searchParams.get('limit');
  const schemas = getSchemaConfig();
  let logs = getSystemLogs();
  if (nodeIdParam !== null)
  {
    const nodeId = parseInt(nodeIdParam, 10);
    logs = logs.filter((log) => log.node_id === nodeId);
  }
  const limit = limitParam ? parseInt(limitParam, 10) : 500;
  logs = logs.slice(0, limit);
  const enriched: EnrichedLog[] = logs.map((log) =>
  {
    const schema = resolveSchemaForLog(log.log_id, schemas);
    const loadValue = getLoadValue(log, schema);
    return {
      log_id: log.log_id,
      node_id: log.node_id,
      http_response_code: log.http_response_code,
      response_time_ms: log.response_time_ms,
      schema_version: schema.version,
      active_column: schema.active_column,
      load_value: loadValue,
    };
  });
  return NextResponse.json(enriched);
}
