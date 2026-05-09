'use client';
import {
  ReactFlow, Node, Edge, Controls, MiniMap, Background, BackgroundVariant,
  useNodesState, useEdgesState, Handle, Position, NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnalysisResult } from '@/lib/types';

interface Props { result: AnalysisResult }

const CATEGORY_COLORS: Record<string, string> = {
  fileio: '#3B82F6', network: '#F59E0B', process: '#EF4444',
  memory: '#8B5CF6', signal: '#EC4899', ipc: '#14B8A6',
  security: '#FF8C00', misc: '#6B7280',
};

function SyscallNode({ data }: NodeProps) {
  const nodeData = data as { label: string; count: number; category: string; avgLatency: number; description: string };
  const color = CATEGORY_COLORS[nodeData.category] || '#6B7280';
  const size = Math.max(40, Math.min(80, 20 + Math.log(nodeData.count + 1) * 10));

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: `${color}20`,
        border: `2px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 12px ${color}40`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      title={`${nodeData.label}\n${nodeData.count} calls\n${nodeData.description}`}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, border: 'none', width: 4, height: 4 }} />
      <span style={{ fontSize: size > 55 ? '10px' : '8px', color, fontFamily: 'var(--font-mono)', fontWeight: 600, textAlign: 'center', padding: '0 2px' }}>
        {nodeData.label}
      </span>
      {size > 50 && (
        <span style={{ fontSize: '8px', color: `${color}80`, fontFamily: 'var(--font-mono)' }}>
          {nodeData.count}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: 'none', width: 4, height: 4 }} />
    </div>
  );
}

const nodeTypes = { syscallNode: SyscallNode };

export default function CallGraphTab({ result }: Props) {
  const initialNodes = result.graphData.nodes.map(n => ({
    ...n,
    style: {},
  })) as Node[];

  const initialEdges = result.graphData.edges.slice(0, 50).map(e => ({
    ...e,
    type: 'smoothstep',
    markerEnd: { type: 'arrowclosed' as const, width: 10, height: 10, color: e.style?.stroke || '#555' },
  })) as Edge[];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary font-mono">Visual Call Graph</h3>
        <div className="flex gap-3 text-[10px] font-mono">
          {Object.entries(CATEGORY_COLORS).slice(0, 6).map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-text-muted capitalize">{cat}</span>
            </span>
          ))}
        </div>
      </div>

      <div
        style={{ height: 500 }}
        className="border border-white/10 rounded-xl overflow-hidden bg-bg-card"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          style={{ background: '#0A0A0F' }}
        >
          <Controls style={{ background: '#16161F', border: '1px solid rgba(255,255,255,0.1)' }} />
          <MiniMap
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)' }}
            nodeColor={n => {
              const d = n.data as { category: string };
              return CATEGORY_COLORS[d?.category] || '#6B7280';
            }}
          />
          <Background variant={BackgroundVariant.Dots} color="#1C1C28" gap={16} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
