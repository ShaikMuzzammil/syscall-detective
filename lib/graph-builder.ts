import { SyscallEvent, GraphNode, GraphEdge, SyscallCategory } from './types';

const CATEGORY_COLORS: Record<SyscallCategory, string> = {
  fileio: '#3B82F6',
  network: '#F59E0B',
  process: '#EF4444',
  memory: '#8B5CF6',
  signal: '#EC4899',
  ipc: '#14B8A6',
  security: '#FF8C00',
  misc: '#6B7280',
};

const SYSCALL_DESCRIPTIONS: Record<string, string> = {
  openat: 'Open or create a file',
  read: 'Read from file descriptor',
  write: 'Write to file descriptor',
  close: 'Close file descriptor',
  mmap: 'Map files or devices into memory',
  mprotect: 'Set memory protection',
  munmap: 'Unmap memory region',
  brk: 'Change data segment size',
  fstat: 'Get file status',
  stat: 'Get file status by path',
  execve: 'Execute a program',
  connect: 'Initiate a connection on a socket',
  socket: 'Create an endpoint for communication',
  send: 'Send a message on a socket',
  recv: 'Receive a message from a socket',
  fork: 'Create a child process',
  clone: 'Create child process or thread',
  futex: 'Fast user-space locking',
  rt_sigaction: 'Examine/change signal action',
  exit_group: 'Exit all threads in process',
  getpid: 'Get process ID',
  getcwd: 'Get current working directory',
  chdir: 'Change working directory',
};

export function buildCallGraph(events: SyscallEvent[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const countMap: Record<string, number> = {};
  const durationMap: Record<string, number> = {};
  const categoryMap: Record<string, SyscallCategory> = {};
  const transitions: Record<string, number> = {};

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    countMap[e.name] = (countMap[e.name] || 0) + 1;
    durationMap[e.name] = (durationMap[e.name] || 0) + e.duration;
    categoryMap[e.name] = e.category;

    if (i > 0) {
      const key = `${events[i-1].name}->${e.name}`;
      transitions[key] = (transitions[key] || 0) + 1;
    }
  }

  const uniqueNames = Object.keys(countMap);

  // Layout in a grid/circular pattern
  const nodes: GraphNode[] = uniqueNames.map((name, i) => {
    const angle = (i / uniqueNames.length) * 2 * Math.PI;
    const radius = 300;
    const count = countMap[name];
    const category = categoryMap[name];

    return {
      id: name,
      type: 'syscallNode',
      position: {
        x: 400 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
      },
      data: {
        label: name,
        count,
        category,
        avgLatency: durationMap[name] / count * 1000000, // to microseconds
        description: SYSCALL_DESCRIPTIONS[name] || `${name} system call`,
      },
    };
  });

  const edges: GraphEdge[] = [];
  const maxTransition = Math.max(...Object.values(transitions), 1);

  for (const [key, freq] of Object.entries(transitions)) {
    const [source, target] = key.split('->');
    if (source === target) continue; // skip self-loops for clarity
    const strokeWidth = Math.max(1, Math.min(5, (freq / maxTransition) * 5));
    const color = CATEGORY_COLORS[categoryMap[source] || 'misc'];

    edges.push({
      id: `${source}-${target}`,
      source,
      target,
      animated: freq > maxTransition * 0.5,
      style: { stroke: color, strokeWidth },
    });
  }

  return { nodes, edges };
}
