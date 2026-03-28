import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import type { SchemaVersion } from '@/types';

interface RawSchemaRow
{
  version: string;
  time_start: string;
  active_column: string;
}

export function parseSchemaConfig(): SchemaVersion[]
{
  // To test the project with the larger sample dataset, change 'Aegis' to 'Aegis_StressTest' below
  const csvPath = path.join(process.cwd(), 'datasets', 'Aegis', 'schema_config.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const result = Papa.parse<RawSchemaRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data
    .map((row) =>
    {
      return {
        version: parseInt(row.version, 10),
        time_start: parseInt(row.time_start, 10),
        active_column: row.active_column,
      };
    })
    .sort((a, b) => a.time_start - b.time_start);
}
