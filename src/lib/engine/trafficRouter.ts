import type {
  TopologyNode,
  TrafficPacket,
  TrafficFlowData,
  BalancerAlgorithm,
} from '@/types/resilience';
import { selectNode, findAlternateRoute } from '@/lib/engine/loadBalancer';

let packetCounter = 0;

function generatePacketId(): string
{
  packetCounter += 1;
  return `PKT-${packetCounter}`;
}

export function computeRoute(
  source: number,
  destination: number,
  nodes: TopologyNode[]
): number[]
{
  const nodeMap = new Map<number, TopologyNode>();
  for (const node of nodes)
  {
    nodeMap.set(node.id, node);
  }
  const visited = new Set<number>();
  const queue: { id: number; path: number[] }[] = [
    { id: source, path: [source] },
  ];
  visited.add(source);
  while (queue.length > 0)
  {
    const current = queue.shift()!;
    if (current.id === destination)
    {
      return current.path;
    }
    const node = nodeMap.get(current.id);
    if (!node) continue;
    for (const neighborId of node.neighbors)
    {
      if (visited.has(neighborId)) continue;
      const neighbor = nodeMap.get(neighborId);
      if (!neighbor || neighbor.health === 'failed') continue;
      visited.add(neighborId);
      queue.push({
        id: neighborId,
        path: [...current.path, neighborId],
      });
    }
  }
  return [source];
}

export function generateTrafficPacket(
  nodes: TopologyNode[],
  algorithm: BalancerAlgorithm
): TrafficPacket
{
  const healthyNodes = nodes.filter((n) => n.health !== 'failed');
  if (healthyNodes.length < 2)
  {
    return {
      id: generatePacketId(),
      source_node: 0,
      destination_node: 0,
      route: [],
      size_bytes: 0,
      status: 'dropped',
      created_at: Date.now(),
      reroute_count: 0,
    };
  }
  const sourceNode = selectNode(algorithm, healthyNodes);
  const destNode = selectNode(
    algorithm,
    healthyNodes.filter((n) => n.id !== sourceNode?.id)
  );
  if (!sourceNode || !destNode)
  {
    return {
      id: generatePacketId(),
      source_node: 0,
      destination_node: 0,
      route: [],
      size_bytes: 0,
      status: 'dropped',
      created_at: Date.now(),
      reroute_count: 0,
    };
  }
  const route = computeRoute(sourceNode.id, destNode.id, nodes);
  const routeHasIssue = route.some((nodeId) =>
  {
    const n = nodes.find((nd) => nd.id === nodeId);
    return n && n.packet_loss_pct > 50;
  });
  let status: TrafficPacket['status'] = 'delivered';
  let rerouteCount = 0;
  if (route.length <= 1 && sourceNode.id !== destNode.id)
  {
    status = 'dropped';
  }
  else if (routeHasIssue)
  {
    const altNode = findAlternateRoute(nodes, route[1], algorithm);
    if (altNode)
    {
      status = 'rerouted';
      rerouteCount = 1;
    }
    else
    {
      status = 'dropped';
    }
  }
  return {
    id: generatePacketId(),
    source_node: sourceNode.id,
    destination_node: destNode.id,
    route,
    size_bytes: Math.floor(Math.random() * 9000) + 1000,
    status,
    created_at: Date.now(),
    reroute_count: rerouteCount,
  };
}

export function generateTrafficBatch(
  nodes: TopologyNode[],
  algorithm: BalancerAlgorithm,
  count: number
): TrafficPacket[]
{
  const packets: TrafficPacket[] = [];
  for (let i = 0; i < count; i++)
  {
    packets.push(generateTrafficPacket(nodes, algorithm));
  }
  return packets;
}

export function computeTrafficFlow(
  packets: TrafficPacket[],
  nodes: TopologyNode[]
): TrafficFlowData
{
  const delivered = packets.filter((p) => p.status === 'delivered').length;
  const dropped = packets.filter((p) => p.status === 'dropped').length;
  const rerouted = packets.filter((p) => p.status === 'rerouted').length;
  const totalBytes = packets.reduce((sum, p) => sum + p.size_bytes, 0);
  const throughputMbps = Math.round((totalBytes * 8) / 1_000_000 * 10) / 10;
  const healthyNodes = nodes.filter((n) => n.health !== 'failed');
  const avgLatency = healthyNodes.length > 0
    ? healthyNodes.reduce((sum, n) => sum + n.latency_ms, 0) / healthyNodes.length
    : 0;
  return {
    packets: packets.slice(-100),
    total_sent: packets.length,
    total_delivered: delivered,
    total_dropped: dropped,
    total_rerouted: rerouted,
    throughput_mbps: throughputMbps,
    avg_latency_ms: Math.round(avgLatency * 100) / 100,
  };
}
