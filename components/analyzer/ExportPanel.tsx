'use client';
import { useEffect, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import toast from 'react-hot-toast';

interface Props { result: AnalysisResult }

const DEFAULT_RECIPIENT_EMAIL = '';
const PREFS_KEY = 'syscall-detective-settings';
const FORMATS = ['PDF Report', 'JSON', 'CSV', 'Markdown'];
const INCLUDE = ['AI Analysis', 'Call Graph (SVG)', 'Histogram', 'Latency Table', 'Raw Trace'];

export default function ExportPanel({ result }: Props) {
  const [format, setFormat] = useState('JSON');
  const [includes, setIncludes] = useState<string[]>(['AI Analysis', 'Histogram', 'Latency Table']);
  const [email, setEmail] = useState(DEFAULT_RECIPIENT_EMAIL);
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://syscalldetective.dev/share/${result.shareId || result.id}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedPrefs = localStorage.getItem(PREFS_KEY);
        if (!savedPrefs) return;

        const parsed = JSON.parse(savedPrefs) as { reportRecipient?: string; autoEmailReports?: boolean };
        if (parsed.autoEmailReports !== false && parsed.reportRecipient) {
          setEmail(parsed.reportRecipient);
        }
      } catch {
        setEmail(DEFAULT_RECIPIENT_EMAIL);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const toggleInclude = (item: string) => {
    setIncludes(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const download = () => {
    if (format === 'JSON') {
      const data = {
        id: result.id,
        program: result.program,
        totalCalls: result.totalCalls,
        weirdnessScore: result.weirdnessScore,
        duration: result.duration,
        syscalls: includes.includes('Raw Trace') ? result.syscalls : undefined,
        aiReport: includes.includes('AI Analysis') ? result.aiReport : undefined,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `syscall-report-${result.program}.json`;
      a.click();
      toast.success('⬇ Downloaded JSON report');
    } else if (format === 'CSV') {
      const csv = ['name,category,count,avgLatency,percentage',
        ...result.syscalls.slice(0, 100).map(s =>
          `${s.name},${s.category},1,${(s.duration * 1000000).toFixed(0)},0`
        )].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `syscall-trace-${result.program}.csv`;
      a.click();
      toast.success('⬇ Downloaded CSV trace');
    } else if (format === 'Markdown') {
      const md = `# Syscall Analysis: ${result.program}\n\n**Total Calls:** ${result.totalCalls}\n**Weirdness Score:** ${result.weirdnessScore}/100\n**Duration:** ${result.duration}s\n\n${result.aiReport || ''}`;
      const blob = new Blob([md], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `syscall-report-${result.program}.md`;
      a.click();
      toast.success('⬇ Downloaded Markdown report');
    } else {
      toast('PDF export requires Pro plan', { icon: '🔒' });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('🔗 Share link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = async () => {
    const res = await fetch('/api/report/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: result.id, recipient: email, program: result.program, weirdnessScore: result.weirdnessScore, totalCalls: result.totalCalls, duration: result.duration, aiReport: result.aiReport }),
    });
    if (res.ok) toast.success('📧 Report sent!');
    else toast.error('Failed to send email');
  };

  return (
    <div className="space-y-6">
      {/* Format */}
      <div>
        <h4 className="text-xs font-mono font-bold text-text-muted mb-3 tracking-widest">FORMAT</h4>
        <div className="grid grid-cols-2 gap-2">
          {FORMATS.map(f => (
            <label key={f} className="flex items-center gap-2 p-3 bg-bg-card border border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-colors">
              <input
                type="radio"
                name="format"
                checked={format === f}
                onChange={() => setFormat(f)}
                className="accent-accent-green"
              />
              <span className="text-xs text-text-secondary font-mono">{f}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Includes */}
      <div>
        <h4 className="text-xs font-mono font-bold text-text-muted mb-3 tracking-widest">INCLUDE</h4>
        <div className="space-y-2">
          {INCLUDE.map(item => (
            <label key={item} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includes.includes(item)}
                onChange={() => toggleInclude(item)}
                className="w-3 h-3 accent-accent-green"
              />
              <span className="text-xs text-text-secondary">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Download */}
      <button
        onClick={download}
        className="w-full py-3 bg-accent-green text-bg-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-accent-green/90 transition-all text-sm"
      >
        <Download className="w-4 h-4" />
        Generate & Download
      </button>

      {/* Email */}
      <div>
        <h4 className="text-xs font-mono font-bold text-text-muted mb-3 tracking-widest">📧 EMAIL REPORT</h4>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-bg-card border border-white/10 rounded-lg text-sm font-mono text-text-primary focus:outline-none focus:border-accent-green/40"
          />
          <button
            onClick={sendEmail}
            className="px-4 py-2.5 bg-bg-card border border-white/10 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-white/20 transition-colors font-medium"
          >
            Send →
          </button>
        </div>
      </div>

      {/* Share link */}
      <div>
        <h4 className="text-xs font-mono font-bold text-text-muted mb-3 tracking-widest">🔗 SHARE LINK</h4>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2.5 bg-bg-card border border-white/10 rounded-lg text-xs font-mono text-text-muted truncate">
            {shareUrl}
          </div>
          <button
            onClick={copyLink}
            className="px-3 py-2.5 bg-bg-card border border-white/10 rounded-lg hover:border-white/20 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4 text-text-muted" />}
          </button>
        </div>
      </div>
    </div>
  );
}
