import { SyscallEvent, SyscallCategory } from './types';

const CATEGORY_MAP: Record<string, SyscallCategory> = {
  // File I/O
  open: 'fileio', openat: 'fileio', close: 'fileio', read: 'fileio', write: 'fileio',
  pread64: 'fileio', pwrite64: 'fileio', readv: 'fileio', writev: 'fileio',
  stat: 'fileio', fstat: 'fileio', lstat: 'fileio', statx: 'fileio',
  access: 'fileio', faccessat: 'fileio', chmod: 'fileio', fchmod: 'fileio',
  chown: 'fileio', fchown: 'fileio', unlink: 'fileio', rename: 'fileio',
  mkdir: 'fileio', rmdir: 'fileio', link: 'fileio', symlink: 'fileio',
  readlink: 'fileio', getdents: 'fileio', getdents64: 'fileio',
  lseek: 'fileio', truncate: 'fileio', ftruncate: 'fileio',
  dup: 'fileio', dup2: 'fileio', dup3: 'fileio',
  inotify_init: 'fileio', inotify_add_watch: 'fileio',
  // Network
  socket: 'network', connect: 'network', bind: 'network', listen: 'network',
  accept: 'network', accept4: 'network', send: 'network', recv: 'network',
  sendto: 'network', recvfrom: 'network', sendmsg: 'network', recvmsg: 'network',
  setsockopt: 'network', getsockopt: 'network', getpeername: 'network',
  getsockname: 'network', shutdown: 'network', socketpair: 'network',
  // Process
  execve: 'process', fork: 'process', vfork: 'process', clone: 'process',
  wait4: 'process', waitpid: 'process', exit: 'process', exit_group: 'process',
  getpid: 'process', getppid: 'process', getuid: 'process', getgid: 'process',
  setuid: 'process', setgid: 'process', kill: 'process', tkill: 'process',
  tgkill: 'process', ptrace: 'process', prctl: 'process', capget: 'process',
  capset: 'process', chdir: 'process', getcwd: 'process',
  // Memory
  mmap: 'memory', mmap2: 'memory', munmap: 'memory', mprotect: 'memory',
  mremap: 'memory', madvise: 'memory', brk: 'memory', sbrk: 'memory',
  mlock: 'memory', munlock: 'memory', mlockall: 'memory',
  shmat: 'memory', shmdt: 'memory', shmget: 'memory', shmctl: 'memory',
  // Signal
  rt_sigaction: 'signal', rt_sigprocmask: 'signal', rt_sigreturn: 'signal',
  sigaltstack: 'signal', pause: 'signal', alarm: 'signal',
  // IPC
  pipe: 'ipc', pipe2: 'ipc', msgget: 'ipc', msgsnd: 'ipc', msgrcv: 'ipc',
  semget: 'ipc', semop: 'ipc', semctl: 'ipc', futex: 'ipc',
  eventfd: 'ipc', eventfd2: 'ipc', timerfd_create: 'ipc',
  // Security
  seccomp: 'security', landlock_create_ruleset: 'security',
  // Everything else -> misc
};

export function getCategory(name: string): SyscallCategory {
  return CATEGORY_MAP[name] || 'misc';
}

export function parseStraceOutput(raw: string): SyscallEvent[] {
  const lines = raw.split('\n').filter(l => l.trim());
  const events: SyscallEvent[] = [];
  let seq = 0;

  for (const line of lines) {
    const event = parseLine(line, ++seq);
    if (event) events.push(event);
  }

  return events;
}

function parseLine(line: string, seq: number): SyscallEvent | null {
  // Match: [pid] [timestamp] syscall(args) = retval <duration>
  const timestampMatch = line.match(/^(\d+:\d+:\d+\.\d+)\s+(.+)/);
  let timestamp = '00:00:00.000000';
  let rest = line;

  if (timestampMatch) {
    timestamp = timestampMatch[1];
    rest = timestampMatch[2];
  }

  // Match pid prefix
  const pidMatch = rest.match(/^\[(\d+)\]\s+(.+)/);
  let pid: number | undefined;
  if (pidMatch) {
    pid = parseInt(pidMatch[1]);
    rest = pidMatch[2];
  }

  // Match syscall(args) = retval <duration>
  const syscallMatch = rest.match(/^(\w+)\(([^)]*(?:\([^)]*\)[^)]*)*)\)\s*=\s*(-?\d+[^\s<]*)(?:\s*<([\d.]+)>)?/);
  if (!syscallMatch) return null;

  const name = syscallMatch[1];
  const argsStr = syscallMatch[2];
  const returnValue = syscallMatch[3];
  const duration = syscallMatch[4] ? parseFloat(syscallMatch[4]) : 0;

  const args = parseArgs(argsStr);
  const category = getCategory(name);
  const isError = returnValue === '-1' || returnValue.startsWith('E') || returnValue === '-EAGAIN';

  return { seq, name, args, returnValue, duration, timestamp, pid, category, isError, rawLine: line };
}

function parseArgs(str: string): string[] {
  // Simple split by comma respecting brackets
  const args: string[] = [];
  let depth = 0;
  let current = '';

  for (const ch of str) {
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

export function buildSummaryStats(events: SyscallEvent[]) {
  const byName: Record<string, { count: number; totalDuration: number; minDuration: number; maxDuration: number }> = {};

  for (const e of events) {
    if (!byName[e.name]) {
      byName[e.name] = { count: 0, totalDuration: 0, minDuration: Infinity, maxDuration: 0 };
    }
    byName[e.name].count++;
    byName[e.name].totalDuration += e.duration;
    byName[e.name].minDuration = Math.min(byName[e.name].minDuration, e.duration);
    byName[e.name].maxDuration = Math.max(byName[e.name].maxDuration, e.duration);
  }

  const totalDuration = events.reduce((sum, e) => sum + e.duration, 0);

  return Object.entries(byName).map(([name, stats]) => ({
    name,
    category: getCategory(name),
    count: stats.count,
    totalDuration: stats.totalDuration,
    avgDuration: stats.totalDuration / stats.count,
    minDuration: stats.minDuration === Infinity ? 0 : stats.minDuration,
    maxDuration: stats.maxDuration,
    percentage: totalDuration > 0 ? (stats.totalDuration / totalDuration) * 100 : 0,
  })).sort((a, b) => b.count - a.count);
}
