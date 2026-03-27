export enum HttpStatus
{
  OPERATIONAL = 'OPERATIONAL',
  HIJACKED = 'HIJACKED',
  DDOS = 'DDOS',
  UNKNOWN = 'UNKNOWN',
}

export interface NodeRecord
{
  node_uuid: number;
  user_agent: string;
  is_infected: boolean;
}

export interface SystemLog
{
  log_id: number;
  node_id: number;
  json_status: string;
  http_response_code: number;
  response_time_ms: number;
  load_val: number | null;
  L_V1: number | null;
}

export interface SchemaVersion
{
  version: number;
  time_start: number;
  active_column: string;
}

export interface ClassifiedNode
{
  node_uuid: number;
  decoded_serial: string;
  encoded_serial: string;
  is_infected: boolean;
  true_status: HttpStatus;
  dominant_http_code: number;
  mean_response_ms: number;
  log_count: number;
  http_200_count: number;
  http_206_count: number;
  http_429_count: number;
}

export interface SleeperReport
{
  node_id: number;
  decoded_serial: string;
  mean_response_ms: number;
  is_sleeper: boolean;
  log_count: number;
}

export interface SchemaLogEntry
{
  log_id: number;
  version: number;
  active_column: string;
  value: number | null;
  is_rotation_event: boolean;
}

export interface ThreatReport
{
  total_nodes: number;
  infected_count: number;
  clean_count: number;
  ddos_count: number;
  hijacked_count: number;
  operational_count: number;
  sleeper_nodes: SleeperReport[];
  shadow_controller: ShadowControllerResult;
  nodes_by_status: Record<HttpStatus, number[]>;
}

export interface ShadowControllerResult
{
  node_id: number;
  decoded_serial: string;
  infected_429_count: number;
}

export interface StatusInfo
{
  status: HttpStatus;
  label: string;
  color: string;
}
