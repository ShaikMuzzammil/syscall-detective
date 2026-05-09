'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AnalysisResult } from '@/lib/types';
import { buildSummaryStats } from '@/lib/strace-parser';
import { getCategoryColor } from '@/lib/utils';

interface Props { result: AnalysisResult }

const SORT_OPTIONS = ['Frequency', 'Alphabetical', 'Category', 'Latency'];
const VIEW_OPTIONS = ['Count', 'Time Spent', '% of Total'];
const CATEGORIES = ['All', 'fileio', 'network', 'process', 'memory', 'signal', 'ipc', 'misc'];

export default function SyscallHistogram({ result }: Props) {
  const [sort, setSort] = useState('Frequency');
  const [view, setView] = useState('Count');
  const [catFilter, setCatFilter] = useState('All');

  let data = buildSummaryStats(result.syscalls);
  if (catFilter !== 'All') data = data.filter(d => d.category === catFilter);

  if (sort === 'Alphabetical') data = [...data].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'Category') data = [...data].sort((a, b) => a.category.localeCompare(b.category));
  else if (sort === 'Latency') data = [...data].sort((a, b) => b.avgDuration - a.avgDuration);

  const chartData = data.slice(0, 15).map(d => ({
    name: d.name,
    value: view === 'Count' ? d.count : view === 'Time Spent' ? +(d.totalDuration * 1000).toFixed(2) : +d.percentage.toFixed(1),
    category: d.category,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                catFilter === cat
                  ? 'bg-accent-green text-bg-primary'
                  : 'bg-bg-card border border-white/10 text-text-muted hover:text-text-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-text-muted">View:</span>
          {VIEW_OPTIONS.map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-2 py-1 text-[10px] rounded transition-colors ${view === v ? 'text-accent-green' : 'text-text-muted hover:text-text-secondary'}`}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-text-muted">Sort:</span>
          {SORT_OPTIONS.map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-2 py-1 text-[10px] rounded transition-colors ${sort === s ? 'text-accent-green' : 'text-text-muted hover:text-text-secondary'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={18}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#888', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fill: '#888', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: '#16161F', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px',
              }}
              labelStyle={{ color: '#F0F0F0' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getCategoryColor(entry.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10">
              {['Syscall', 'Category', 'Count', 'Avg Latency', '% Total'].map(h => (
                <th key={h} className="text-left py-2 px-2 text-text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 20).map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                <td className="py-2 px-2" style={{ color: getCategoryColor(row.category) }}>{row.name}</td>
                <td className="py-2 px-2 text-text-muted capitalize">{row.category}</td>
                <td className="py-2 px-2 text-text-secondary">{row.count.toLocaleString()}</td>
                <td className="py-2 px-2 text-text-muted">{(row.avgDuration * 1000000).toFixed(0)}µs</td>
                <td className="py-2 px-2 text-text-muted">{row.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
