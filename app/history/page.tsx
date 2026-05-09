'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, Share2, Trash2, Search, Filter } from 'lucide-react';

const MOCK_HISTORY = [
  { id: '1', program: 'curl https://evil.com', calls: 12441, duration: 1.2, weirdness: 81, date: '2h ago', color: '#FF4444' },
  { id: '2', program: 'ls -la /home', calls: 4832, duration: 0.34, weirdness: 12, date: '1 day ago', color: '#00FF88' },
  { id: '3', program: 'python3 scraper.py', calls: 28991, duration: 4.1, weirdness: 54, date: '3 days ago', color: '#F59E0B' },
  { id: '4', program: 'nginx -g daemon off', calls: 8721, duration: 2.1, weirdness: 31, date: '1 week ago', color: '#F59E0B' },
  { id: '5', program: 'node server.js', calls: 15234, duration: 3.2, weirdness: 42, date: '2 weeks ago', color: '#F59E0B' },
  { id: '6', program: 'gcc main.c -o app', calls: 22451, duration: 5.6, weirdness: 8, date: '3 weeks ago', color: '#00FF88' },
];

function WeirdnessBadge({ score }: { score: number }) {
  const color = score <= 30 ? '#00FF88' : score <= 60 ? '#F59E0B' : '#FF4444';
  const emoji = score <= 30 ? '🟢' : score <= 60 ? '🟡' : '🔴';
  return (
    <span className="font-mono text-sm font-bold" style={{ color }}>
      {emoji} {score}
    </span>
  );
}

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = MOCK_HISTORY.filter(h =>
    h.program.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              <span className="text-accent-green">$</span> Analysis History
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {MOCK_HISTORY.length} analyses · {MOCK_HISTORY.reduce((s, h) => s + h.calls, 0).toLocaleString()} total syscalls traced
            </p>
          </div>
          <Link href="/analyze" className="px-4 py-2 bg-accent-green text-bg-primary font-semibold rounded-xl text-sm hover:bg-accent-green/90 transition-all">
            + New Analysis
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Analyses', value: '23' },
            { label: 'Most Analyzed', value: 'curl' },
            { label: 'Avg Weirdness', value: '31' },
            { label: 'Time Saved', value: '~4h' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-text-primary">{s.value}</div>
              <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search analyses..."
              className="w-full pl-9 pr-3 py-2.5 bg-bg-card border border-white/10 rounded-lg text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/40"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2.5 bg-bg-card border border-white/10 rounded-lg text-sm text-text-muted">
            <Filter className="w-3.5 h-3.5" />Filter
          </button>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex gap-2 mb-4 p-3 bg-accent-green/5 border border-accent-green/20 rounded-lg">
            <span className="text-xs text-accent-green font-mono">{selected.length} selected</span>
            {selected.length === 2 && (
              <Link href="/compare" className="text-xs text-accent-green hover:underline">Compare →</Link>
            )}
            <button className="text-xs text-danger-red hover:underline ml-auto">Delete Selected</button>
          </div>
        )}

        {/* Table */}
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="w-10 p-3"></th>
                {['Date', 'Program', 'Calls', 'Duration', 'Weirdness', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-mono text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="w-3 h-3 accent-accent-green"
                    />
                  </td>
                  <td className="px-3 py-3 text-xs text-text-muted font-mono">{row.date}</td>
                  <td className="px-3 py-3">
                    <span className="text-sm font-mono text-text-secondary">{row.program}</span>
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-text-muted">{row.calls.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm font-mono text-text-muted">{row.duration}s</td>
                  <td className="px-3 py-3"><WeirdnessBadge score={row.weirdness} /></td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <Link href="/analyze" className="p-1.5 rounded-lg bg-bg-card hover:bg-bg-hover transition-colors">
                        <Eye className="w-3.5 h-3.5 text-text-muted" />
                      </Link>
                      <button className="p-1.5 rounded-lg bg-bg-card hover:bg-bg-hover transition-colors">
                        <Share2 className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-bg-card hover:bg-bg-hover transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-danger-red/50 hover:text-danger-red" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
