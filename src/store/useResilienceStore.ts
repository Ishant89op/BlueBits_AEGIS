import { create } from 'zustand';
import type {
  NetworkTopologyData,
  TrafficFlowData,
  ChaosSimulationState,
  BalancerState,
  BalancerAlgorithm,
  ChaosEvent,
  TopologyNode,
} from '@/types/resilience';

interface ResilienceState
{
  topology: NetworkTopologyData | null;
  traffic: TrafficFlowData | null;
  chaos: ChaosSimulationState | null;
  balancer: BalancerState | null;
  algorithm: BalancerAlgorithm;
  simulationRunning: boolean;
  loading: boolean;
  localNodes: TopologyNode[];
  localEvents: ChaosEvent[];
  setTopology: (data: NetworkTopologyData) => void;
  setTraffic: (data: TrafficFlowData) => void;
  setChaos: (data: ChaosSimulationState) => void;
  setBalancer: (data: BalancerState) => void;
  setAlgorithm: (algo: BalancerAlgorithm) => void;
  setSimulationRunning: (running: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLocalNodes: (nodes: TopologyNode[]) => void;
  addLocalEvent: (event: ChaosEvent) => void;
  clearLocalEvents: () => void;
}

export const useResilienceStore = create<ResilienceState>((set) => ({
  topology: null,
  traffic: null,
  chaos: null,
  balancer: null,
  algorithm: 'round-robin',
  simulationRunning: false,
  loading: true,
  localNodes: [],
  localEvents: [],
  setTopology: (data) => set({ topology: data }),
  setTraffic: (data) => set({ traffic: data }),
  setChaos: (data) => set({ chaos: data }),
  setBalancer: (data) => set({ balancer: data }),
  setAlgorithm: (algo) => set({ algorithm: algo }),
  setSimulationRunning: (running) => set({ simulationRunning: running }),
  setLoading: (loading) => set({ loading }),
  setLocalNodes: (nodes) => set({ localNodes: nodes }),
  addLocalEvent: (event) =>
    set((state) => ({
      localEvents: [...state.localEvents, event],
    })),
  clearLocalEvents: () => set({ localEvents: [] }),
}));
