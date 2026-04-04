export type NodeHealth = 'healthy' | 'degraded' | 'failed' | 'recovering';

export type BalancerAlgorithm = 'round-robin' | 'least-latency' | 'weighted';

export type ChaosEventType = 'ddos' | 'shutdown' | 'corruption' | 'latency-spike';

export interface TopologyNode
{
  id: number;
  serial: string;
  health: NodeHealth;
  latency_ms: number;
  weight: number;
  active_connections: number;
  max_connections: number;
  throughput_mbps: number;
  packet_loss_pct: number;
  is_gateway: boolean;
  cluster_id: number;
  x: number;
  y: number;
  neighbors: number[];
}

export interface TopologyEdge
{
  source: number;
  target: number;
  bandwidth_mbps: number;
  utilization_pct: number;
  latency_ms: number;
  is_active: boolean;
}

export interface NetworkTopologyData
{
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  clusters: ClusterInfo[];
  gateway_ids: number[];
  total_bandwidth_mbps: number;
  active_routes: number;
}

export interface ClusterInfo
{
  id: number;
  name: string;
  node_count: number;
  healthy_count: number;
  gateway_id: number;
  color: string;
}

export interface TrafficPacket
{
  id: string;
  source_node: number;
  destination_node: number;
  route: number[];
  size_bytes: number;
  status: 'in-transit' | 'delivered' | 'dropped' | 'rerouted';
  created_at: number;
  reroute_count: number;
}

export interface TrafficFlowData
{
  packets: TrafficPacket[];
  total_sent: number;
  total_delivered: number;
  total_dropped: number;
  total_rerouted: number;
  throughput_mbps: number;
  avg_latency_ms: number;
}

export interface ChaosEvent
{
  id: string;
  type: ChaosEventType;
  target_nodes: number[];
  severity: number;
  started_at: number;
  duration_ms: number;
  is_active: boolean;
  description: string;
}

export interface ChaosSimulationState
{
  is_running: boolean;
  events: ChaosEvent[];
  affected_nodes: number[];
  nodes_recovered: number[];
  recovery_time_ms: number;
  resilience_score: number;
}

export interface BalancerState
{
  algorithm: BalancerAlgorithm;
  active_nodes: number[];
  failed_nodes: number[];
  round_robin_index: number;
  routes_computed: number;
  failovers_triggered: number;
  avg_route_latency_ms: number;
}

export interface ResilienceReport
{
  topology: NetworkTopologyData;
  traffic: TrafficFlowData;
  chaos: ChaosSimulationState;
  balancer: BalancerState;
}
