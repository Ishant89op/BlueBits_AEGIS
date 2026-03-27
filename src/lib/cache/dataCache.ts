import type { NodeRecord, SystemLog, SchemaVersion } from '@/types';
import { parseNodeRegistry } from '@/lib/data/parseNodeRegistry';
import { parseSystemLogs } from '@/lib/data/parseSystemLogs';
import { parseSchemaConfig } from '@/lib/data/parseSchemaConfig';

let cachedNodes: NodeRecord[] | null = null;
let cachedLogs: SystemLog[] | null = null;
let cachedSchema: SchemaVersion[] | null = null;

export function getNodeRegistry(): NodeRecord[]
{
  if (!cachedNodes)
  {
    cachedNodes = parseNodeRegistry();
  }
  return cachedNodes;
}

export function getSystemLogs(): SystemLog[]
{
  if (!cachedLogs)
  {
    cachedLogs = parseSystemLogs();
  }
  return cachedLogs;
}

export function getSchemaConfig(): SchemaVersion[]
{
  if (!cachedSchema)
  {
    cachedSchema = parseSchemaConfig();
  }
  return cachedSchema;
}
