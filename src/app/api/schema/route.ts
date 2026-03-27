import { NextResponse } from 'next/server';
import { getSchemaConfig, getSystemLogs } from '@/lib/cache/dataCache';
import { generateSchemaEventLog } from '@/lib/engine/resolveSchema';
import type { SchemaVersion, SchemaLogEntry } from '@/types';

interface SchemaResponse
{
  versions: SchemaVersion[];
  event_log: SchemaLogEntry[];
}

export async function GET(): Promise<NextResponse<SchemaResponse>>
{
  const schemas = getSchemaConfig();
  const logs = getSystemLogs();
  const eventLog = generateSchemaEventLog(logs, schemas);
  return NextResponse.json({
    versions: schemas,
    event_log: eventLog,
  });
}
