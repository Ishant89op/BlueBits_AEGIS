import type {
  TopologyNode,
  TopologyEdge,
  NetworkTopologyData,
  ClusterInfo,
} from '@/types/resilience';
import type { ClassifiedNode } from '@/types';
import { HttpStatus } from '@/types';

const CLUSTER_COLORS = [
  '#00FF88', '#0566d9', '#FACC15', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#6366F1', '#84CC16',
];

const CLUSTER_NAMES = [
  'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA',
  'ECHO', 'FOXTROT', 'GOLF', 'HOTEL',
  'INDIA', 'JULIET',
];

function assignCluster(nodeId: number, totalClusters: number): number
{
  return nodeId % totalClusters;
}

function buildNodePosition(
  nodeId: number,
  clusterId: number,
  nodesPerCluster: number
): { x: number; y: number }
{
  const clusterCols = 5;
  const clusterRow = Math.floor(clusterId / clusterCols);
  const clusterCol = clusterId % clusterCols;
  const indexInCluster = Math.floor(nodeId / 10) % nodesPerCluster;
  const subRow = Math.floor(indexInCluster / 7);
  const subCol = indexInCluster % 7;
  const baseX = clusterCol * 220 + 60;
  const baseY = clusterRow * 260 + 60;
  return {
    x: baseX + subCol * 28 + (Math.random() * 8 - 4),
    y: baseY + subRow * 28 + (Math.random() * 8 - 4),
  };
}

export function buildTopology(
  classifiedNodes: ClassifiedNode[]
): NetworkTopologyData
{
  const totalClusters = 10;
  const nodesPerCluster = Math.ceil(classifiedNodes.length / totalClusters);
  const topologyNodes: TopologyNode[] = classifiedNodes.map((cn) =>
  {
    const clusterId = assignCluster(cn.node_uuid, totalClusters);
    const pos = buildNodePosition(cn.node_uuid, clusterId, nodesPerCluster);
    let health: TopologyNode['health'] = 'healthy';
    if (cn.true_status === HttpStatus.HIJACKED)
    {
      health = 'failed';
    }
    else if (cn.true_status === HttpStatus.DDOS)
    {
      health = 'degraded';
    }
    else if (cn.is_infected)
    {
      health = 'degraded';
    }
    const isGateway = cn.node_uuid % nodesPerCluster === 0;
    const neighbors: number[] = [];
    if (cn.node_uuid > 0)
    {
      neighbors.push(cn.node_uuid - 1);
    }
    if (cn.node_uuid < classifiedNodes.length - 1)
    {
      neighbors.push(cn.node_uuid + 1);
    }
    const gatewayId = clusterId * nodesPerCluster;
    if (!isGateway && gatewayId < classifiedNodes.length)
    {
      neighbors.push(gatewayId);
    }
    const crossClusterTarget =
      ((clusterId + 1) % totalClusters) * nodesPerCluster;
    if (isGateway && crossClusterTarget < classifiedNodes.length)
    {
      neighbors.push(crossClusterTarget);
    }
    return {
      id: cn.node_uuid,
      serial: cn.decoded_serial,
      health,
      latency_ms: cn.mean_response_ms,
      weight: health === 'healthy' ? 10 : health === 'degraded' ? 3 : 0,
      active_connections: cn.log_count,
      max_connections: 100,
      throughput_mbps: health === 'failed'
        ? 0
        : Math.round((1 - cn.mean_response_ms / 300) * 100),
      packet_loss_pct: health === 'failed'
        ? 100
        : health === 'degraded'
          ? Math.round(cn.mean_response_ms / 10)
          : Math.round(cn.mean_response_ms / 50),
      is_gateway: isGateway,
      cluster_id: clusterId,
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      neighbors: [...new Set(neighbors)],
    };
  });
  const edgeSet = new Set<string>();
  const edges: TopologyEdge[] = [];
  for (const node of topologyNodes)
  {
    for (const neighborId of node.neighbors)
    {
      const key = `${Math.min(node.id, neighborId)}-${Math.max(node.id, neighborId)}`;
      if (!edgeSet.has(key))
      {
        edgeSet.add(key);
        const neighbor = topologyNodes.find((n) => n.id === neighborId);
        if (neighbor)
        {
          const avgLatency = (node.latency_ms + neighbor.latency_ms) / 2;
          edges.push({
            source: node.id,
            target: neighborId,
            bandwidth_mbps: Math.round(
              (node.throughput_mbps + neighbor.throughput_mbps) / 2
            ),
            utilization_pct: Math.min(
              95,
              Math.round(
                ((node.active_connections + neighbor.active_connections) / 200)
                * 100
              )
            ),
            latency_ms: Math.round(avgLatency),
            is_active: node.health !== 'failed' && neighbor.health !== 'failed',
          });
        }
      }
    }
  }
  const clusterMap = new Map<number, { total: number; healthy: number }>();
  for (const node of topologyNodes)
  {
    const entry = clusterMap.get(node.cluster_id);
    if (entry)
    {
      entry.total += 1;
      if (node.health === 'healthy') entry.healthy += 1;
    }
    else
    {
      clusterMap.set(node.cluster_id, {
        total: 1,
        healthy: node.health === 'healthy' ? 1 : 0,
      });
    }
  }
  const clusters: ClusterInfo[] = Array.from(clusterMap.entries()).map(
    ([id, data]) =>
    {
      const gatewayId = id * nodesPerCluster;
      return {
        id,
        name: CLUSTER_NAMES[id] || `CLUSTER_${id}`,
        node_count: data.total,
        healthy_count: data.healthy,
        gateway_id: gatewayId < classifiedNodes.length ? gatewayId : -1,
        color: CLUSTER_COLORS[id] || '#6B7280',
      };
    }
  );
  const gatewayIds = topologyNodes
    .filter((n) => n.is_gateway)
    .map((n) => n.id);
  return {
    nodes: topologyNodes,
    edges,
    clusters,
    gateway_ids: gatewayIds,
    total_bandwidth_mbps: edges.reduce((sum, e) => sum + e.bandwidth_mbps, 0),
    active_routes: edges.filter((e) => e.is_active).length,
  };
}
