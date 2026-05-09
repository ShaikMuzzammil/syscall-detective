'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BarChart2, GitBranch, Thermometer, AlertTriangle, SplitSquareHorizontal, Brain } from 'lucide-react';

const BENTO_ITEMS = [
  {
    id: 'callgraph',
    title: 'Visual Call Graph',
    desc: 'Interactive node graph showing syscall relationships, call frequency, and execution flow.',
    icon: GitBranch,
    color: '#3B82F6',
    span: 'lg:col-span-2 lg:row-span-2',
    preview: 'graph',
  },
  {
    id: 'histogram',
    title: 'Syscall Histogram',
    desc: 'Color-coded bar chart with sorting and filtering',
    icon: BarChart2,
    color: '#F59E0B',
    span: '',
    preview: 'bars',
  },
  {
    id: 'weirdness',
    title: 'Weirdness Score',
    desc: 'AI-powered 0-100 risk score',
    icon: AlertTriangle,
    color: '#FF4444',
    span: '',
    preview: 'gauge',
  },
  {
    id: 'heatmap',
    title: 'Time Heatmap',
    desc: 'Syscall density over execution time',
    icon: Thermometer,
    color: '#EC4899',
    span: '',
    preview: 'heatmap',
  },
  {
    id: 'ai',
    title: 'AI Explanation',
    desc: '"This program opened 47 files and made 3 network connections to fetch a TLS-secured resource..."',
    icon: Brain,
    color: '#00FF88',
    span: 'lg:col-span-2',
    preview: 'ai',
  },
  {
    id: 'compare',
    title: 'Compare Mode',
    desc: 'Side-by-side diff of any two programs',
    icon: SplitSquareHorizontal,
    color: '#7C3AED',
    span: '',
    preview: 'compare',
  },
];

const HEATMAP_CELLS = [
  0.66, 0.92, 0.24, 0.58, 0.36, 0.72, 0.83, 0.41,
  0.55, 0.68, 0.31, 0.88, 0.47, 0.63, 0.79, 0.27,
  0.52, 0.95, 0.61, 0.33, 0.74, 0.86, 0.44, 0.57,
];

function PreviewContent({ type, color }: { type: string; color: string }) {
  if (type === 'graph') {
    return (
      <svg width="100%" height="120" className="opacity-60">
        {[
          { x: 80, y: 60, r: 20, label: 'read' },
          { x: 160, y: 30, r: 14, label: 'openat' },
          { x: 200, y: 80, r: 10, label: 'mmap' },
          { x: 280, y: 50, r: 16, label: 'write' },
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r={node.r} fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
            <text x={node.x} y={node.y + 4} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace">{node.label}</text>
          </g>
        ))}
        <line x1="100" y1="55" x2="150" y2="38" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        <line x1="165" y1="40" x2="195" y2="75" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        <line x1="210" y1="78" x2="268" y2="58" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        <circle r="3" fill="#00FF88">
          <animateMotion dur="2s" repeatCount="indefinite" path="M100,55 L150,38 L195,75 L268,58" />
        </circle>
      </svg>
    );
  }
  if (type === 'bars') {
    const vals = [87, 62, 45, 78, 35, 55, 90, 40];
    return (
      <svg width="100%" height="60" className="opacity-70">
        {vals.map((v, i) => (
          <rect
            key={i}
            x={i * 14 + 2}
            y={60 - v * 0.55}
            width="10"
            height={v * 0.55}
            fill={color}
            fillOpacity="0.7"
            rx="2"
          />
        ))}
      </svg>
    );
  }
  if (type === 'gauge') {
    const score = 23;
    const gaugeColor = '#00FF88';
    return (
      <svg width="80" height="50" className="opacity-80 mx-auto">
        <path d="M5 45 A 35 35 0 0 1 75 45" fill="none" stroke="#1C1C28" strokeWidth="8" strokeLinecap="round" />
        <path d="M5 45 A 35 35 0 0 1 75 45" fill="none" stroke={gaugeColor} strokeWidth="8" strokeLinecap="round"
          strokeDasharray="110" strokeDashoffset={110 - (score / 100) * 110} />
        <text x="40" y="38" textAnchor="middle" fill={gaugeColor} fontSize="14" fontWeight="bold" fontFamily="monospace">{score}</text>
      </svg>
    );
  }
  if (type === 'heatmap') {
    return (
      <div className="flex gap-0.5 opacity-70">
        {HEATMAP_CELLS.map((v, i) => (
          <div
            key={i}
            className="h-6 flex-1 rounded-sm"
            style={{
              backgroundColor: v < 0.3 ? '#00FF88' : v < 0.6 ? '#F59E0B' : '#FF4444',
              opacity: 0.3 + v * 0.7,
            }}
          />
        ))}
      </div>
    );
  }
  if (type === 'ai') {
    return (
      <div className="text-xs text-text-secondary font-mono leading-relaxed opacity-80 mt-1">
        <span className="text-accent-green">AI: </span>
        This program opened 47 files and made 3 network connections to fetch a TLS-secured resource on port 443. No suspicious behavior detected. DNS resolution took 45ms. Recommend using connection pooling for performance...
      </div>
    );
  }
  if (type === 'compare') {
    return (
      <div className="flex gap-2 mt-1">
        <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-[10px] font-mono text-blue-400">
          A: ls<br />4,832 calls<br />Score: 12
        </div>
        <div className="flex items-center justify-center text-text-muted text-xs">vs</div>
        <div className="flex-1 bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-[10px] font-mono text-purple-400">
          B: curl<br />12,441 calls<br />Score: 61
        </div>
      </div>
    );
  }
  return null;
}

export default function BentoGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="text-accent-green font-mono text-sm mb-3 tracking-widest">FEATURES</div>
          <h2 className="text-4xl font-bold text-text-primary">Everything You Need to Understand Any Binary</h2>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-4 auto-rows-min">
          {BENTO_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className={`glass rounded-xl p-5 card-hover ${item.span}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary">{item.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <PreviewContent type={item.preview} color={item.color} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
