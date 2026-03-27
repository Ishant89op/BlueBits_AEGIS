import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import type { SystemLog } from '@/types';

interface RawLogRow
{
  log_id: string;
  node_id: string;
  json_status: string;
  http_response_code: string;
  response_time_ms: string;
  load_val: string;
  L_V1: string;
}

export function parseSystemLogs(): SystemLog[]
{
  const csvPath = path.join(process.cwd(), 'datasets', 'Aegis', 'system_logs.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const result = Papa.parse<RawLogRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data.map((row) =>
  {
    return {
      log_id: parseInt(row.log_id, 10),
      node_id: parseInt(row.node_id, 10),
      json_status: row.json_status,
      http_response_code: parseInt(row.http_response_code, 10),
      response_time_ms: parseInt(row.response_time_ms, 10),
      load_val: row.load_val ? parseFloat(row.load_val) : null,
      L_V1: row.L_V1 ? parseFloat(row.L_V1) : null,
    };
  });
}
