'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Search, Terminal, Upload, Link2, Code2, ChevronDown, AlertTriangle } from 'lucide-react';

const PROGRAMS = [
  { name: 'ls', icon: '📁', category: 'FileIO', calls: '4.8k' },
  { name: 'cat', icon: '📄', category: 'FileIO', calls: '1.2k' },
  { name: 'grep', icon: '🔍', category: 'FileIO', calls: '2.1k' },
  { name: 'curl', icon: '🌐', category: 'Network', calls: '12.4k' },
  { name: 'wget', icon: '⬇️', category: 'Network', calls: '9.8k' },
  { name: 'ping', icon: '📡', category: 'Network', calls: '3.4k' },
  { name: 'python3', icon: '🐍', category: 'Process', calls: '28.9k' },
  { name: 'node', icon: '🟢', category: 'Process', calls: '15.2k' },
  { name: 'nginx', icon: '⚡', category: 'Network', calls: '8.7k' },
  { name: 'bash', icon: '💻', category: 'Process', calls: '6.1k' },
  { name: 'ssh', icon: '🔐', category: 'Network', calls: '11.3k' },
  { name: 'git', icon: '🔀', category: 'FileIO', calls: '18.5k' },
  { name: 'npm', icon: '📦', category: 'Process', calls: '42.1k' },
  { name: 'docker', icon: '🐳', category: 'Process', calls: '35.7k' },
  { name: 'vim', icon: '📝', category: 'FileIO', calls: '7.3k' },
  { name: 'gcc', icon: '⚙️', category: 'Process', calls: '22.4k' },
  { name: 'find', icon: '🔎', category: 'FileIO', calls: '5.6k' },
  { name: 'make', icon: '🏗️', category: 'Process', calls: '19.8k' },
];

const TABS = [
  { id: 'program', icon: Search, label: 'Programs' },
  { id: 'command', icon: Terminal, label: 'Command' },
  { id: 'upload', icon: Upload, label: 'Upload' },
];

interface Props {
  onAnalyze: (program: string, command?: string) => void;
  loading: boolean;
}

export default function InputPanel({ onAnalyze, loading }: Props) {
  const [activeTab, setActiveTab] = useState('program');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [command, setCommand] = useState('');
  const [search, setSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const filteredPrograms = PROGRAMS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAnalyze = () => {
    if (activeTab === 'program' && selectedProgram) {
      onAnalyze(selectedProgram);
    } else if (activeTab === 'command' && command) {
      const prog = command.trim().split(' ')[0].split('/').pop() || 'bash';
      onAnalyze(prog, command);
    } else {
      onAnalyze('ls');
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-accent-green border-b-2 border-accent-green bg-accent-green/5'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {/* Tab content */}
        {activeTab === 'program' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search programs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-bg-card border border-white/10 rounded-lg text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/40 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {filteredPrograms.map(prog => (
                <button
                  key={prog.name}
                  onClick={() => setSelectedProgram(prog.name)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                    selectedProgram === prog.name
                      ? 'bg-accent-green/10 border border-accent-green/30 text-text-primary'
                      : 'bg-bg-card border border-transparent hover:border-white/10 text-text-secondary'
                  }`}
                >
                  <span className="text-sm">{prog.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-medium truncate">{prog.name}</div>
                    <div className="text-[10px] text-text-muted">{prog.calls} calls</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'command' && (
          <div className="space-y-3">
            <div className="bg-bg-card border border-white/10 rounded-lg overflow-hidden">
              <div className="flex items-center px-3 py-2 border-b border-white/10">
                <span className="text-accent-green font-mono text-sm mr-2">$</span>
                <input
                  type="text"
                  placeholder="ls -la /tmp"
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  className="flex-1 bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <div className="px-3 py-2 flex flex-wrap gap-1.5">
                {['ls -la /tmp', 'curl https://example.com', 'python3 -c "print(42)"'].map(ex => (
                  <button
                    key={ex}
                    onClick={() => setCommand(ex)}
                    className="text-[10px] font-mono px-2 py-1 bg-bg-hover rounded text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors w-full"
            >
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform"
                style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
              Advanced Options
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {[
                    { label: 'Timeout', value: '5s' },
                    { label: 'Max syscalls', value: '10,000' },
                  ].map(opt => (
                    <div key={opt.label} className="flex items-center justify-between text-xs text-text-muted">
                      <span>{opt.label}:</span>
                      <span className="font-mono bg-bg-card px-2 py-1 rounded">{opt.value}</span>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-1.5">
                    {['FileIO', 'Network', 'Process', 'Memory'].map(cat => (
                      <label key={cat} className="flex items-center gap-1 text-[10px] text-text-muted cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 accent-accent-green" />
                        {cat}
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-3">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onAnalyze(file.name, `Uploaded file: ${file.name}`);
                }
              }}
            />
            <label
              htmlFor="file-upload"
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  onAnalyze(file.name, `Uploaded file: ${file.name}`);
                }
              }}
              className={`block border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-accent-green bg-accent-green/5' : 'border-white/20 hover:border-white/40'
              }`}
            >
              <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary mb-1">Drop strace output or binary</p>
              <p className="text-xs text-text-muted">.txt, .log, ELF, script · Max 50MB</p>
              <span className="inline-block mt-3 px-4 py-2 bg-bg-card border border-white/10 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                Browse Files
              </span>
            </label>
            <div className="flex items-start gap-2 p-3 bg-warning-orange/5 border border-warning-orange/20 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-warning-orange shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-muted leading-relaxed">
                Uploaded strace files will be parsed. Binaries are analyzed in an isolated sandbox.
              </p>
            </div>
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || (activeTab === 'program' && !selectedProgram)}
          className="w-full mt-4 py-3.5 bg-accent-green text-bg-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-accent-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed pulse-green-btn"
        >
          <Zap className="w-4 h-4" />
          {loading ? 'Analyzing...' : '⚡ Analyze Now'}
        </button>
        <p className="text-center text-[11px] text-text-muted mt-2 font-mono">
          Estimated time: ~3 seconds
        </p>
      </div>
    </div>
  );
}
