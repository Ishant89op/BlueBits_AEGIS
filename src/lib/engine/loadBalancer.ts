import type {
  TopologyNode,
  BalancerAlgorithm,
  BalancerState,
} from '@/types/resilience';

let rrIndex = 0;

export function resetRoundRobin(): void
{
  rrIndex = 0;
}

export function selectNodeRoundRobin(
  activeNodes: TopologyNode[]
): TopologyNode | null
{
  if (activeNodes.length === 0) return null;
  const node = activeNodes[rrIndex % activeNodes.length];
  rrIndex = (rrIndex + 1) % activeNodes.length;
  return node;
}

export function selectNodeLeastLatency(
  activeNodes: TopologyNode[]
): TopologyNode | null
{
  if (activeNodes.length === 0) return null;
  let best = activeNodes[0];
  for (let i = 1; i < activeNodes.length; i++)
  {
    if (activeNodes[i].latency_ms < best.latency_ms)
    {
      best = activeNodes[i];
    }
  }
  return best;
}

export function selectNodeWeighted(
  activeNodes: TopologyNode[]
): TopologyNode | null
{
  if (activeNodes.length === 0) return null;
  const totalWeight = activeNodes.reduce((sum, n) => sum + n.weight, 0);
  if (totalWeight === 0) return activeNodes[0];
  let random = Math.random() * totalWeight;
  for (const node of activeNodes)
  {
    random -= node.weight;
    if (random <= 0) return node;
  }
  return activeNodes[activeNodes.length - 1];
}

export function selectNode(
  algorithm: BalancerAlgorithm,
  activeNodes: TopologyNode[]
): TopologyNode | null
{
  switch (algorithm)
  {
    case 'round-robin':
      return selectNodeRoundRobin(activeNodes);
    case 'least-latency':
      return selectNodeLeastLatency(activeNodes);
    case 'weighted':
      return selectNodeWeighted(activeNodes);
    default:
      return selectNodeRoundRobin(activeNodes);
  }
}

export function computeBalancerState(
  allNodes: TopologyNode[],
  algorithm: BalancerAlgorithm,
  failedNodeIds: number[]
): BalancerState
{
  const failedSet = new Set(failedNodeIds);
  const activeNodes = allNodes.filter(
    (n) => !failedSet.has(n.id) && n.health !== 'failed'
  );
  const failedNodes = allNodes.filter(
    (n) => failedSet.has(n.id) || n.health === 'failed'
  );
  const avgLatency = activeNodes.length > 0
    ? activeNodes.reduce((sum, n) => sum + n.latency_ms, 0) / activeNodes.length
    : 0;
  return {
    algorithm,
    active_nodes: activeNodes.map((n) => n.id),
    failed_nodes: failedNodes.map((n) => n.id),
    round_robin_index: rrIndex,
    routes_computed: activeNodes.length * (activeNodes.length - 1),
    failovers_triggered: failedNodes.length,
    avg_route_latency_ms: Math.round(avgLatency * 100) / 100,
  };
}

export function findAlternateRoute(
  allNodes: TopologyNode[],
  failedNodeId: number,
  algorithm: BalancerAlgorithm
): TopologyNode | null
{
  const failedNode = allNodes.find((n) => n.id === failedNodeId);
  if (!failedNode) return null;
  const sameClusterNodes = allNodes.filter(
    (n) =>
      n.cluster_id === failedNode.cluster_id &&
      n.id !== failedNodeId &&
      n.health !== 'failed'
  );
  if (sameClusterNodes.length > 0)
  {
    return selectNode(algorithm, sameClusterNodes);
  }
  const allActive = allNodes.filter(
    (n) => n.id !== failedNodeId && n.health !== 'failed'
  );
  return selectNode(algorithm, allActive);
}
