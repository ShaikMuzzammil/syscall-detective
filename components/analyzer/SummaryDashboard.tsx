'use client';
import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import WeirdnessGauge from '../shared/WeirdnessGauge';
import { AlertTriangle, Eye, Trash2 } from 'lucide-react';
import { buildSummaryStats } from '@/lib/strace-parser';
import { getCategoryColor } from '@/lib/utils';
import { getWeirdnessLevel } from '@/lib/weirdness-scorer';

interface Props { result: AnalysisResult }

const METRIC_CARDS = (r: AnalysisResult) => [
  { label: 'TOTAL CALLS', value: r.totalCalls.toLocaleString(), sub: '↑ syscalls traced', color: '#3B82F6' },
  { label: 'UNIQUE CALLS', value: r.uniqueCalls.toString(), sub: 'distinct syscalls', color: '#7C3AED' },
  { label: 'DURATION', value: `${r.duration.toFixed(2)}s`, sub: 'execution time', color: '#F59E0B' },
];

export default function SummaryDashboard({ result }: Props) {
  const stats = buildSummaryStats(result.syscalls).slice(0, 10);
  const { level, color } = getWeirdnessLevel(result.weirdnessScore);
  const triggered = result.weirdnessRules?.filter(r => r.triggered) || [];

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRIC_CARDS(result).map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-bg-card rounded-xl p-4"
            style={{ borderLeft: `3px solid ${card.color}` }}
          >
            <div className="text-[10px] font-mono text-text-muted mb-1">{card.label}</div>
            <div className="text-2xl font-bold font-mono text-text-primary">{card.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
        {/* Weirdness card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.21 }}
          className="bg-bg-card rounded-xl p-4 flex flex-col items-center"
          style={{ borderLeft: `3px solid ${color}` }}
        >
          <div className="text-[10px] font-mono text-text-muted mb-1 self-start">WEIRDNESS</div>
          <WeirdnessGauge score={result.weirdnessScore} size={80} showLabel={false} />
          <div className="text-[10px] font-mono mt-1" style={{ color }}>{level} RISK</div>
        </motion.div>
      </div>

      {/* Suspicious alert */}
      {result.weirdnessScore > 30 && triggered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="border rounded-xl overflow-hidden pulse-red"
          style={{ borderColor: '#FF444430' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-danger-red/10 border-b border-danger-red/20">
            <AlertTriangle className="w-4 h-4 text-danger-red" />
            <span className="text-sm font-bold text-danger-red">⚠ SUSPICIOUS ACTIVITY DETECTED</span>
          </div>
          <div className="p-4 space-y-2">
            {triggered.map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-danger-red shrink-0">🔴</span>
                <span className="text-text-secondary">{rule.reason}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-white/10 rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors">
              <Eye className="w-3 h-3" />View Details
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-danger-red/10 border border-danger-red/20 rounded-lg text-xs text-danger-red hover:bg-danger-red/20 transition-colors">
              <Trash2 className="w-3 h-3" />Report as Malware
            </button>
          </div>
        </motion.div>
      )}

      {/* Top syscalls */}
      <div>
        <h3 className="text-xs font-mono font-bold text-text-muted mb-3 tracking-widest">TOP SYSCALLS</h3>
        <div className="space-y-2">
          {stats.map((stat, i) => {
            const barWidth = (stat.count / stats[0].count) * 100;
            const catColor = getCategoryColor(stat.category);
            return (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3"
              >
                <span className="w-4 text-xs text-text-muted font-mono">{i + 1}.</span>
                <span className="w-20 text-xs font-mono shrink-0" style={{ color: catColor }}>{stat.name}</span>
                <div className="flex-1 h-2 bg-bg-card rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: catColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                  />
                </div>
                <span className="w-12 text-xs text-text-muted font-mono text-right">{stat.count.toLocaleString()}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI quick summary */}
      {result.aiReport && (
        <div className="p-4 bg-accent-green/5 border border-accent-green/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-accent-green text-sm">🤖</span>
            <span className="text-xs font-mono font-bold text-accent-green">AI QUICK SUMMARY</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {result.aiReport.split('\n')[2]?.trim() || result.aiReport.slice(0, 200)}
          </p>
        </div>
      )}
    </div>
  );
}
