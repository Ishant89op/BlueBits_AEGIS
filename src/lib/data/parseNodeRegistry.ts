import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import type { NodeRecord } from '@/types';

interface RawNodeRow
{
  node_uuid: string;
  user_agent: string;
  is_infected: string;
}

export function parseNodeRegistry(): NodeRecord[]
{
  const csvPath = path.join(process.cwd(), 'datasets', 'Aegis', 'node_registry.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const result = Papa.parse<RawNodeRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data.map((row) =>
  {
    return {
      node_uuid: parseInt(row.node_uuid, 10),
      user_agent: row.user_agent,
      is_infected: row.is_infected === 'True',
    };
  });
}
