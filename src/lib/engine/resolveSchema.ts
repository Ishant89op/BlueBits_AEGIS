import type { SchemaVersion, SystemLog, SchemaLogEntry } from '@/types';

export function resolveSchemaForLog(
  logId: number,
  schemas: SchemaVersion[]
): SchemaVersion
{
  let resolved = schemas[0];
  for (const schema of schemas)
  {
    if (schema.time_start <= logId)
    {
      resolved = schema;
    }
  }
  return resolved;
}

export function getLoadValue(
  log: SystemLog,
  schema: SchemaVersion
): number | null
{
  if (schema.active_column === 'load_val')
  {
    return log.load_val;
  }
  return log.L_V1;
}

export function generateSchemaEventLog(
  logs: SystemLog[],
  schemas: SchemaVersion[]
): SchemaLogEntry[]
{
  const sorted = [...logs].sort((a, b) => a.log_id - b.log_id);
  let previousVersion = -1;
  const entries: SchemaLogEntry[] = [];
  for (const log of sorted)
  {
    const schema = resolveSchemaForLog(log.log_id, schemas);
    const isRotation = schema.version !== previousVersion;
    const value = getLoadValue(log, schema);
    entries.push({
      log_id: log.log_id,
      version: schema.version,
      active_column: schema.active_column,
      value,
      is_rotation_event: isRotation,
    });
    previousVersion = schema.version;
  }
  return entries;
}
