import type {
  ChaosEvent,
  ChaosEventType,
  ChaosSimulationState,
  TopologyNode,
} from '@/types/resilience';

let eventCounter = 0;

function generateEventId(): string
{
  eventCounter += 1;
  return `CHAOS-${Date.now()}-${eventCounter}`;
}

const EVENT_DESCRIPTIONS: Record<ChaosEventType, string[]> = {
  ddos: [
    'Volumetric DDoS flood targeting gateway',
    'SYN flood attack on cluster ingress',
    'UDP amplification attack detected',
  ],
  shutdown: [
    'Sudden power failure on node rack',
    'Kernel panic - node unresponsive',
    'Hardware failure - disk I/O error',
  ],
  corruption: [
    'Packet checksum mismatch detected',
    'TLS certificate corruption event',
    'Memory bit-flip causing data corruption',
  ],
  'latency-spike': [
    'Network congestion - 10x latency increase',
    'DNS resolution timeout cascade',
    'BGP route flapping causing delays',
  ],
};

function pickDescription(type: ChaosEventType): string
{
  const options = EVENT_DESCRIPTIONS[type];
  return options[Math.floor(Math.random() * options.length)];
}

export function createChaosEvent(
  type: ChaosEventType,
  targetNodes: number[],
  severity: number,
  durationMs: number
): ChaosEvent
{
  return {
    id: generateEventId(),
    type,
    target_nodes: targetNodes,
    severity: Math.min(10, Math.max(1, severity)),
    started_at: Date.now(),
    duration_ms: durationMs,
    is_active: true,
    description: pickDescription(type),
  };
}

export function generateRandomChaosEvent(
  availableNodes: TopologyNode[]
): ChaosEvent
{
  const types: ChaosEventType[] = [
    'ddos', 'shutdown', 'corruption', 'latency-spike',
  ];
  const type = types[Math.floor(Math.random() * types.length)];
  const numTargets = Math.min(
    availableNodes.length,
    Math.floor(Math.random() * 5) + 1
  );
  const shuffled = [...availableNodes].sort(() => Math.random() - 0.5);
  const targetNodes = shuffled.slice(0, numTargets).map((n) => n.id);
  const severity = Math.floor(Math.random() * 8) + 3;
  const durationMs = (Math.floor(Math.random() * 10) + 5) * 1000;
  return createChaosEvent(type, targetNodes, severity, durationMs);
}

export function applyEventToNodes(
  nodes: TopologyNode[],
  event: ChaosEvent
): TopologyNode[]
{
  const targetSet = new Set(event.target_nodes);
  return nodes.map((node) =>
  {
    if (!targetSet.has(node.id)) return node;
    switch (event.type)
    {
      case 'shutdown':
        return {
          ...node,
          health: 'failed' as const,
          weight: 0,
          throughput_mbps: 0,
          packet_loss_pct: 100,
          active_connections: 0,
        };
      case 'ddos':
        return {
          ...node,
          health: 'degraded' as const,
          weight: Math.max(1, Math.floor(node.weight / event.severity)),
          latency_ms: node.latency_ms * (1 + event.severity * 0.5),
          packet_loss_pct: Math.min(80, node.packet_loss_pct + event.severity * 8),
          throughput_mbps: Math.max(1, Math.floor(node.throughput_mbps / event.severity)),
        };
      case 'corruption':
        return {
          ...node,
          health: 'degraded' as const,
          weight: Math.max(2, node.weight - event.severity),
          packet_loss_pct: Math.min(60, node.packet_loss_pct + event.severity * 5),
        };
      case 'latency-spike':
        return {
          ...node,
          health: 'degraded' as const,
          latency_ms: node.latency_ms * (1 + event.severity),
          weight: Math.max(1, Math.floor(node.weight / 2)),
        };
      default:
        return node;
    }
  });
}

export function recoverNodes(
  nodes: TopologyNode[],
  recoveredIds: number[]
): TopologyNode[]
{
  const recoverSet = new Set(recoveredIds);
  return nodes.map((node) =>
  {
    if (!recoverSet.has(node.id)) return node;
    return {
      ...node,
      health: 'recovering' as const,
      weight: 5,
      throughput_mbps: Math.max(20, node.throughput_mbps),
      packet_loss_pct: Math.max(5, Math.floor(node.packet_loss_pct / 2)),
      latency_ms: Math.max(100, Math.floor(node.latency_ms * 0.6)),
    };
  });
}

export function computeResilienceScore(
  nodes: TopologyNode[],
  events: ChaosEvent[]
): number
{
  const totalNodes = nodes.length;
  if (totalNodes === 0) return 100;
  const healthyCount = nodes.filter(
    (n) => n.health === 'healthy' || n.health === 'recovering'
  ).length;
  const healthRatio = healthyCount / totalNodes;
  const activeEvents = events.filter((e) => e.is_active).length;
  const eventPenalty = Math.min(30, activeEvents * 5);
  const avgPacketLoss = nodes.reduce(
    (sum, n) => sum + n.packet_loss_pct, 0
  ) / totalNodes;
  const lossPenalty = Math.min(20, avgPacketLoss / 2);
  const score = Math.max(
    0,
    Math.round(healthRatio * 100 - eventPenalty - lossPenalty)
  );
  return score;
}

export function buildSimulationState(
  nodes: TopologyNode[],
  events: ChaosEvent[],
  isRunning: boolean
): ChaosSimulationState
{
  const affectedNodes: number[] = [];
  const recoveredNodes: number[] = [];
  for (const event of events)
  {
    if (event.is_active)
    {
      affectedNodes.push(...event.target_nodes);
    }
  }
  for (const node of nodes)
  {
    if (node.health === 'recovering')
    {
      recoveredNodes.push(node.id);
    }
  }
  const recoverTimeMs = recoveredNodes.length > 0
    ? Math.round(Math.random() * 5000 + 2000)
    : 0;
  return {
    is_running: isRunning,
    events,
    affected_nodes: [...new Set(affectedNodes)],
    nodes_recovered: [...new Set(recoveredNodes)],
    recovery_time_ms: recoverTimeMs,
    resilience_score: computeResilienceScore(nodes, events),
  };
}
