import { SyscallEvent, WeirdnessRule } from './types';

function extractPort(e: SyscallEvent): number | null {
  const portMatch = e.args.join(' ').match(/sin_port=htons\((\d+)\)/);
  return portMatch ? parseInt(portMatch[1]) : null;
}

function extractMode(e: SyscallEvent): string | null {
  const modeMatch = e.args.join(' ').match(/0(\d{3})/);
  return modeMatch ? modeMatch[0] : null;
}

const RULE_DEFS: Array<{
  name: string;
  score: number;
  reason: string;
  check: (s: SyscallEvent[]) => boolean;
}> = [
  {
    name: 'shell_spawn',
    score: 20,
    reason: 'Shell spawned via execve',
    check: (s) => s.some(e => e.name === 'execve' && e.args.some(a => a.includes('bash') || a.includes('sh"'))),
  },
  {
    name: 'suspicious_port',
    score: 20,
    reason: 'Connection to suspicious port (4444, 1337, 31337)',
    check: (s) => s.some(e => e.name === 'connect' && [4444, 1337, 31337].includes(extractPort(e) ?? 0)),
  },
  {
    name: 'ptrace_attach',
    score: 15,
    reason: 'ptrace PTRACE_ATTACH — possible anti-debugging or injection',
    check: (s) => s.some(e => e.name === 'ptrace' && e.args[0]?.includes('PTRACE_ATTACH')),
  },
  {
    name: 'shadow_read',
    score: 20,
    reason: 'Attempted /etc/shadow access — credential harvest',
    check: (s) => s.some(e => e.args.some(a => a.includes('/etc/shadow'))),
  },
  {
    name: 'passwd_read',
    score: 8,
    reason: '/etc/passwd accessed — user enumeration',
    check: (s) => s.some(e => e.args.some(a => a.includes('/etc/passwd'))),
  },
  {
    name: 'proc_maps',
    score: 5,
    reason: 'Read /proc/self/maps — possible ASLR bypass attempt',
    check: (s) => s.some(e => e.args.some(a => a.includes('/proc/self/maps') || a.includes('/proc/*/maps'))),
  },
  {
    name: 'many_connects',
    score: 10,
    reason: 'High outbound connection count (>20) — possible scanner',
    check: (s) => s.filter(e => e.name === 'connect').length > 20,
  },
  {
    name: 'chmod_executable',
    score: 8,
    reason: 'Made file world-executable (chmod 0777)',
    check: (s) => s.some(e => e.name === 'chmod' && extractMode(e) === '0777'),
  },
  {
    name: 'mmap_exec',
    score: 5,
    reason: 'Executable memory mapping — possible shellcode injection',
    check: (s) => s.some(e => e.name === 'mmap' && e.args.some(a => a.includes('PROT_EXEC'))),
  },
  {
    name: 'fork_bomb_pattern',
    score: 12,
    reason: 'High fork/clone count — possible fork bomb or parallel attack',
    check: (s) => s.filter(e => e.name === 'fork' || e.name === 'clone').length > 50,
  },
  {
    name: 'dev_random',
    score: 3,
    reason: 'Reads from /dev/random or /dev/urandom — key generation',
    check: (s) => s.some(e => e.args.some(a => a.includes('/dev/random') || a.includes('/dev/urandom'))),
  },
  {
    name: 'sys_admin',
    score: 10,
    reason: 'Mount or privileged operations detected',
    check: (s) => s.some(e => ['mount', 'umount2', 'pivot_root', 'chroot'].includes(e.name)),
  },
];

export function computeWeirdnessScore(syscalls: SyscallEvent[]): {
  score: number;
  rules: WeirdnessRule[];
} {
  const rules: WeirdnessRule[] = RULE_DEFS.map(rule => ({
    name: rule.name,
    score: rule.score,
    reason: rule.reason,
    triggered: rule.check(syscalls),
  }));

  const score = Math.min(100, rules.filter(r => r.triggered).reduce((sum, r) => sum + r.score, 0));

  return { score, rules };
}

export function getWeirdnessLevel(score: number): { level: string; color: string; emoji: string } {
  if (score <= 30) return { level: 'LOW', color: '#00FF88', emoji: '🟢' };
  if (score <= 60) return { level: 'MEDIUM', color: '#F59E0B', emoji: '🟡' };
  return { level: 'HIGH', color: '#FF4444', emoji: '🔴' };
}
