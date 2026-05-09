export type SyscallCategory = 'fileio' | 'network' | 'process' | 'memory' | 'signal' | 'ipc' | 'security' | 'misc';

export interface SyscallEvent {
  seq: number;
  name: string;
  args: string[];
  returnValue: string;
  duration: number;
  timestamp: string;
  pid?: number;
  category: SyscallCategory;
  isError: boolean;
  rawLine: string;
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    count: number;
    category: SyscallCategory;
    avgLatency: number;
    description: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  style: { stroke: string; strokeWidth: number };
  label?: string;
}

export interface WeirdnessRule {
  name: string;
  score: number;
  reason: string;
  triggered: boolean;
}

export interface AnalysisResult {
  id: string;
  program: string;
  command?: string;
  syscalls: SyscallEvent[];
  graphData: { nodes: GraphNode[]; edges: GraphEdge[] };
  weirdnessScore: number;
  weirdnessRules: WeirdnessRule[];
  aiReport?: string;
  totalCalls: number;
  uniqueCalls: number;
  duration: number;
  shareId?: string;
  createdAt: string;
}

export interface SyscallReference {
  name: string;
  number: number;
  category: SyscallCategory;
  signature: string;
  description: string;
  args: { name: string; type: string; description: string }[];
  returnValue: string;
  securityNotes?: string;
  relatedSyscalls: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  date: string;
  content: string;
}
