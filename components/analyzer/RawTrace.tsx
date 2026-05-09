'use client';
import { useState, useMemo } from 'react';
import { AnalysisResult } from '@/lib/types';
import { Search, Copy, Download } from 'lucide-react';
import { getCategoryColor } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props { result: AnalysisResult }

const CATEGORY_OPTIONS = ['All', 'fileio', 'network', 'process', 'memory', 'signal', 'ipc', 'misc'];

export default function RawTrace({ result }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return result.syscalls.filter(s => {
      if (catFilter !== 'All' && s.category !== catFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.name.includes(q) || s.rawLine.toLowerCase().includes(q) || s.args.some(a => a.toLowerCase().includes(q));
      }
      return true;
    });
  }, [result.syscalls, search, catFilter]);

  const copyAll = () => {
    navigator.clipboard.writeText(filtered.map(s => s.rawLine).join('\n'));
    toast.success('🔗 Copied trace to clipboard');
  };

  const download = () => {
    const blob = new Blob([filtered.map(s => s.rawLine).join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${result.program}-strace.txt`;
    a.click();
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search syscalls, args, paths..."
            className="w-full pl-8 pr-3 py-2 bg-bg-card border border-white/10 rounded-lg text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/40"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2 bg-bg-card border border-white/10 rounded-lg text-xs font-mono text-text-secondary focus:outline-none"
        >
          {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={copyAll} className="flex items-center gap-1.5 px-3 py-2 bg-bg-card border border-white/10 rounded-lg text-xs text-text-muted hover:text-text-secondary transition-colors">
          <Copy className="w-3.5 h-3.5" />Copy All
        </button>
        <button onClick={download} className="flex items-center gap-1.5 px-3 py-2 bg-bg-card border border-white/10 rounded-lg text-xs text-text-muted hover:text-text-secondary transition-colors">
          <Download className="w-3.5 h-3.5" />.txt
        </button>
      </div>

      <div className="text-[11px] text-text-muted font-mono">
        Showing {filtered.length.toLocaleString()} / {result.syscalls.length.toLocaleString()} syscalls
      </div>

      {/* Lines */}
      <div className="bg-bg-card border border-white/10 rounded-xl overflow-hidden">
        <div className="max-h-96 overflow-y-auto font-mono text-[11px] leading-relaxed">
          {filtered.slice(0, 500).map((s, i) => {
            const color = getCategoryColor(s.category);
            const isExp = expanded === i;
            return (
              <div
                key={i}
                onClick={() => setExpanded(isExp ? null : i)}
                className="flex items-baseline gap-2 px-3 py-1 border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
              >
                <span className="text-text-muted w-10 shrink-0 select-none">
                  {String(s.seq).padStart(4, ' ')}
                </span>
                <span className="text-text-muted w-20 shrink-0">{s.timestamp}</span>
                <span className="break-all" style={{ color }}>
                  {s.name}
                  <span className="text-text-muted">({s.args.join(', ')})</span>
                  <span className="text-text-muted"> = </span>
                  <span className={s.isError ? 'text-danger-red' : 'text-text-secondary'}>{s.returnValue}</span>
                  {s.duration > 0 && <span className="text-text-muted"> &lt;{(s.duration * 1000000).toFixed(0)}µs&gt;</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length > 500 && (
        <p className="text-xs text-text-muted text-center font-mono">
          Showing first 500 of {filtered.length.toLocaleString()} results. Download .txt for full trace.
        </p>
      )}
    </div>
  );
}
