'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

const SYSCALLS = [
  { name: 'openat', number: 257, category: 'fileio', desc: 'Open or create a file relative to a directory fd' },
  { name: 'read', number: 0, category: 'fileio', desc: 'Read from a file descriptor' },
  { name: 'write', number: 1, category: 'fileio', desc: 'Write to a file descriptor' },
  { name: 'close', number: 3, category: 'fileio', desc: 'Close a file descriptor' },
  { name: 'fstat', number: 5, category: 'fileio', desc: 'Get file status by file descriptor' },
  { name: 'mmap', number: 9, category: 'memory', desc: 'Map files or devices into memory' },
  { name: 'mprotect', number: 10, category: 'memory', desc: 'Set protection on a region of memory' },
  { name: 'munmap', number: 11, category: 'memory', desc: 'Unmap a mapped region' },
  { name: 'brk', number: 12, category: 'memory', desc: 'Change data segment size' },
  { name: 'rt_sigaction', number: 13, category: 'signal', desc: 'Examine and change a signal action' },
  { name: 'socket', number: 41, category: 'network', desc: 'Create an endpoint for communication' },
  { name: 'connect', number: 42, category: 'network', desc: 'Initiate a connection on a socket' },
  { name: 'accept', number: 43, category: 'network', desc: 'Accept a connection on a socket' },
  { name: 'send', number: 44, category: 'network', desc: 'Send a message on a socket' },
  { name: 'recv', number: 45, category: 'network', desc: 'Receive a message from a socket' },
  { name: 'execve', number: 59, category: 'process', desc: 'Execute a program' },
  { name: 'fork', number: 57, category: 'process', desc: 'Create a child process' },
  { name: 'exit_group', number: 231, category: 'process', desc: 'Exit all threads in a process group' },
  { name: 'clone', number: 56, category: 'process', desc: 'Create child process or thread' },
  { name: 'ptrace', number: 101, category: 'process', desc: 'Process tracing and debugging' },
  { name: 'futex', number: 202, category: 'ipc', desc: 'Fast user-space locking' },
  { name: 'pipe', number: 22, category: 'ipc', desc: 'Create a pipe for IPC' },
  { name: 'getdents64', number: 217, category: 'fileio', desc: 'Get directory entries' },
  { name: 'stat', number: 4, category: 'fileio', desc: 'Get file status by path name' },
  { name: 'lstat', number: 6, category: 'fileio', desc: 'Get file status (with symlinks)' },
];

const CATEGORIES = ['All', 'fileio', 'network', 'process', 'memory', 'signal', 'ipc', 'security', 'misc'];
const CATEGORY_COLORS: Record<string, string> = {
  fileio: '#3B82F6', network: '#F59E0B', process: '#EF4444',
  memory: '#8B5CF6', signal: '#EC4899', ipc: '#14B8A6', security: '#FF8C00', misc: '#6B7280',
};

export default function SyscallsPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = SYSCALLS.filter(s => {
    if (cat !== 'All' && s.category !== cat) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.includes(q) || s.desc.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            <span className="text-accent-green">$</span> Syscall Reference
          </h1>
          <p className="text-text-secondary">400+ Linux syscalls documented with signatures and security notes</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search 400+ Linux syscalls..."
            className="w-full pl-10 pr-4 py-3 bg-bg-card border border-white/10 rounded-xl text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/40"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                cat === c ? 'bg-accent-green text-bg-primary' : 'bg-bg-card border border-white/10 text-text-muted hover:text-text-secondary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {filtered.map((s, i) => {
            const color = CATEGORY_COLORS[s.category] || '#6B7280';
            return (
              <Link
                key={i}
                href={`/docs/syscalls/${s.name}`}
                className="glass rounded-xl p-4 card-hover flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm" style={{ color }}>{s.name}</span>
                  <span className="text-[10px] font-mono text-text-muted bg-bg-card px-1.5 py-0.5 rounded">#{s.number}</span>
                </div>
                <span
                  className="text-[10px] font-mono self-start px-1.5 py-0.5 rounded capitalize"
                  style={{ color, background: `${color}15` }}
                >
                  {s.category}
                </span>
                <p className="text-xs text-text-muted leading-relaxed">{s.desc}</p>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted">No syscalls found for &quot;{search}&quot;</div>
        )}
      </div>
    </div>
  );
}
