import { create } from 'zustand';
import type { ClassifiedNode, ThreatReport } from '@/types';

interface AegisState
{
  nodes: ClassifiedNode[];
  threatReport: ThreatReport | null;
  selectedNodeId: number | null;
  filter: 'ALL' | 'DDOS' | 'HIJACKED' | 'CLEAN';
  loading: boolean;
  setNodes: (nodes: ClassifiedNode[]) => void;
  setThreatReport: (report: ThreatReport) => void;
  setSelectedNodeId: (id: number | null) => void;
  setFilter: (filter: 'ALL' | 'DDOS' | 'HIJACKED' | 'CLEAN') => void;
  setLoading: (loading: boolean) => void;
}

export const useAegisStore = create<AegisState>((set) => ({
  nodes: [],
  threatReport: null,
  selectedNodeId: null,
  filter: 'ALL',
  loading: true,
  setNodes: (nodes) => set({ nodes }),
  setThreatReport: (report) => set({ threatReport: report }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ loading }),
}));
