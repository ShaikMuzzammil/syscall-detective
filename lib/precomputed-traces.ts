import { SyscallEvent } from './types';
import { getCategory } from './strace-parser';

// Pre-computed realistic strace data for demo programs

function makeSyscall(seq: number, name: string, args: string[], retval: string, duration: number): SyscallEvent {
  return {
    seq,
    name,
    args,
    returnValue: retval,
    duration,
    timestamp: `00:00:${String(Math.floor(seq * 0.001)).padStart(2,'0')}.${String((seq * 1000) % 1000000).padStart(6,'0')}`,
    category: getCategory(name),
    isError: retval === '-1' || retval.startsWith('E'),
    rawLine: `${name}(${args.join(', ')}) = ${retval} <${duration}>`,
  };
}

export const PRECOMPUTED_TRACES: Record<string, { syscalls: SyscallEvent[]; weirdnessScore: number; duration: number }> = {
  ls: {
    weirdnessScore: 12,
    duration: 0.34,
    syscalls: [
      makeSyscall(1, 'execve', ['"/bin/ls"', '["ls", "-la", "/tmp"]', '0x7ffe...'], '0', 0.000234),
      makeSyscall(2, 'brk', ['NULL'], '0x55a7b2000000', 0.000002),
      makeSyscall(3, 'openat', ['AT_FDCWD', '"/etc/ld.so.cache"', 'O_RDONLY|O_CLOEXEC'], '3', 0.000045),
      makeSyscall(4, 'fstat', ['3', '{st_mode=S_IFREG|0644, st_size=47822}'], '0', 0.000003),
      makeSyscall(5, 'mmap', ['NULL', '47822', 'PROT_READ', 'MAP_PRIVATE', '3', '0'], '0x7f3a2c000000', 0.000012),
      makeSyscall(6, 'close', ['3'], '0', 0.000002),
      makeSyscall(7, 'openat', ['AT_FDCWD', '"/lib/x86_64-linux-gnu/libselinux.so.1"', 'O_RDONLY|O_CLOEXEC'], '3', 0.000038),
      makeSyscall(8, 'read', ['3', '"\\177ELF\\2\\1\\1\\3..."', '832'], '832', 0.000005),
      makeSyscall(9, 'mmap', ['NULL', '8192', 'PROT_READ|PROT_WRITE', 'MAP_PRIVATE|MAP_ANONYMOUS', '-1', '0'], '0x7f3a2c000000', 0.000008),
      makeSyscall(10, 'mprotect', ['0x7f3a2c000000', '4096', 'PROT_READ'], '0', 0.000003),
      makeSyscall(11, 'close', ['3'], '0', 0.000002),
      makeSyscall(12, 'openat', ['AT_FDCWD', '"/lib/x86_64-linux-gnu/libc.so.6"', 'O_RDONLY|O_CLOEXEC'], '3', 0.000041),
      makeSyscall(13, 'read', ['3', '"\\177ELF..."', '832'], '832', 0.000004),
      makeSyscall(14, 'mmap', ['NULL', '2000000', 'PROT_READ', 'MAP_PRIVATE|MAP_DENYWRITE', '3', '0'], '0x7f3a2a000000', 0.000015),
      makeSyscall(15, 'mprotect', ['0x7f3a2a200000', '1769472', 'PROT_NONE'], '0', 0.000004),
      makeSyscall(16, 'close', ['3'], '0', 0.000002),
      makeSyscall(17, 'getuid', [], '1000', 0.000001),
      makeSyscall(18, 'getgid', [], '1000', 0.000001),
      makeSyscall(19, 'stat', ['"/tmp"', '{st_mode=S_IFDIR|S_ISVTX|0777, st_size=4096}'], '0', 0.000008),
      makeSyscall(20, 'openat', ['AT_FDCWD', '"/tmp"', 'O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY'], '3', 0.000022),
      makeSyscall(21, 'getdents64', ['3', '/* 47 entries */', '32768'], '1536', 0.000089),
      makeSyscall(22, 'getdents64', ['3', '/* 0 entries */', '32768'], '0', 0.000003),
      makeSyscall(23, 'close', ['3'], '0', 0.000002),
      makeSyscall(24, 'fstat', ['1', '{st_mode=S_IFCHR|0620, st_rdev=makedev(0x88,0)}'], '0', 0.000003),
      makeSyscall(25, 'write', ['1', '"total 0\\ndrwxrwxrwt..."', '1024'], '1024', 0.000056),
      makeSyscall(26, 'close', ['1'], '0', 0.000003),
      makeSyscall(27, 'exit_group', ['0'], '', 0.000002),
      // Additional calls to make it more realistic
      ...Array.from({ length: 50 }, (_, i) =>
        makeSyscall(28 + i, ['read', 'fstat', 'mmap', 'close', 'openat'][i % 5],
          ['3', '"..."', '4096'], i % 5 === 2 ? '0x7f...' : i % 5 === 3 ? '0' : String(i % 100 + 1),
          Math.random() * 0.0001)
      ),
    ],
  },
  curl: {
    weirdnessScore: 23,
    duration: 0.89,
    syscalls: [
      makeSyscall(1, 'execve', ['"/usr/bin/curl"', '["curl", "https://example.com"]', '0x7ffe...'], '0', 0.000234),
      makeSyscall(2, 'brk', ['NULL'], '0x55a7b2000000', 0.000002),
      makeSyscall(3, 'openat', ['AT_FDCWD', '"/etc/ld.so.cache"', 'O_RDONLY|O_CLOEXEC'], '3', 0.000045),
      makeSyscall(4, 'mmap', ['NULL', '8192', 'PROT_READ|PROT_WRITE', 'MAP_PRIVATE|MAP_ANONYMOUS', '-1', '0'], '0x7f...', 0.000008),
      makeSyscall(5, 'openat', ['AT_FDCWD', '"/etc/resolv.conf"', 'O_RDONLY|O_CLOEXEC'], '4', 0.000031),
      makeSyscall(6, 'read', ['4', '"nameserver 8.8.8.8\\n..."', '4096'], '67', 0.000004),
      makeSyscall(7, 'close', ['4'], '0', 0.000002),
      makeSyscall(8, 'socket', ['AF_INET', 'SOCK_DGRAM|SOCK_CLOEXEC|SOCK_NONBLOCK', 'IPPROTO_IP'], '4', 0.000018),
      makeSyscall(9, 'connect', ['4', '{sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("8.8.8.8")}', '16'], '0', 0.000025),
      makeSyscall(10, 'send', ['4', '"\\0\\x1f\\x01\\0\\0\\x01..."', '29', 'MSG_NOSIGNAL'], '29', 0.000012),
      makeSyscall(11, 'recv', ['4', '"\\0\\x1f\\x81\\x80..."', '1024', '0'], '45', 0.045231),
      makeSyscall(12, 'close', ['4'], '0', 0.000002),
      makeSyscall(13, 'socket', ['AF_INET', 'SOCK_STREAM|SOCK_CLOEXEC', 'IPPROTO_TCP'], '4', 0.000019),
      makeSyscall(14, 'connect', ['4', '{sa_family=AF_INET, sin_port=htons(443), sin_addr=inet_addr("93.184.216.34")}', '16'], '0', 0.120451),
      makeSyscall(15, 'send', ['4', '"\\x16\\x03\\x01\\x02..."', '517', 'MSG_NOSIGNAL'], '517', 0.000089),
      makeSyscall(16, 'recv', ['4', '"\\x16\\x03\\x03\\x00..."', '16384', '0'], '5843', 0.089234),
      makeSyscall(17, 'send', ['4', '"GET / HTTP/1.1\\r\\n..."', '347', 'MSG_NOSIGNAL'], '347', 0.000045),
      makeSyscall(18, 'recv', ['4', '"HTTP/1.1 200 OK\\r\\n..."', '16384', '0'], '1256', 0.234567),
      makeSyscall(19, 'write', ['1', '"<!doctype html>\\n..."', '1256'], '1256', 0.000078),
      makeSyscall(20, 'close', ['4'], '0', 0.000003),
      makeSyscall(21, 'munmap', ['0x7f...', '8192'], '0', 0.000005),
      makeSyscall(22, 'exit_group', ['0'], '', 0.000002),
      ...Array.from({ length: 80 }, (_, i) =>
        makeSyscall(23 + i, ['read', 'write', 'mmap', 'close', 'openat', 'fstat', 'recv', 'send'][i % 8],
          ['4', '"..."', '4096'], i % 3 === 0 ? '0' : String(i % 200 + 1), Math.random() * 0.001)
      ),
    ],
  },
  python3: {
    weirdnessScore: 18,
    duration: 1.2,
    syscalls: [
      makeSyscall(1, 'execve', ['"/usr/bin/python3"', '["python3", "-c", "print(\'hello\')"]', '0x7ffe...'], '0', 0.000234),
      makeSyscall(2, 'brk', ['NULL'], '0x55a7b2000000', 0.000002),
      ...Array.from({ length: 120 }, (_, i) =>
        makeSyscall(3 + i, ['openat', 'read', 'mmap', 'mprotect', 'fstat', 'close', 'stat', 'getcwd'][i % 8],
          ['AT_FDCWD', '"..."', '4096'], i % 4 === 0 ? '0' : String(i % 100 + 1), Math.random() * 0.0002)
      ),
      makeSyscall(123, 'write', ['1', '"hello\\n"', '6'], '6', 0.000012),
      makeSyscall(124, 'exit_group', ['0'], '', 0.000002),
    ],
  },
  nginx: {
    weirdnessScore: 31,
    duration: 2.1,
    syscalls: [
      makeSyscall(1, 'execve', ['"/usr/sbin/nginx"', '["nginx", "-g", "daemon off;"]', '0x7ffe...'], '0', 0.000234),
      makeSyscall(2, 'socket', ['AF_INET', 'SOCK_STREAM', '0'], '4', 0.000019),
      makeSyscall(3, 'bind', ['4', '{sa_family=AF_INET, sin_port=htons(80)}', '16'], '0', 0.000015),
      makeSyscall(4, 'listen', ['4', '511'], '0', 0.000005),
      makeSyscall(5, 'clone', ['CLONE_VM|CLONE_FS|CLONE_FILES...', '...'], '12345', 0.000234),
      makeSyscall(6, 'accept4', ['4', '{sa_family=AF_INET, sin_port=htons(54321)}', '16', 'SOCK_NONBLOCK|SOCK_CLOEXEC'], '5', 0.001234),
      makeSyscall(7, 'read', ['5', '"GET / HTTP/1.1\\r\\n..."', '4096'], '87', 0.000045),
      makeSyscall(8, 'openat', ['AT_FDCWD', '"/var/www/html/index.html"', 'O_RDONLY|O_NONBLOCK'], '6', 0.000038),
      makeSyscall(9, 'fstat', ['6', '{st_mode=S_IFREG|0644, st_size=1234}'], '0', 0.000003),
      makeSyscall(10, 'write', ['5', '"HTTP/1.1 200 OK\\r\\n..."', '1400'], '1400', 0.000089),
      makeSyscall(11, 'close', ['5'], '0', 0.000003),
      makeSyscall(12, 'close', ['6'], '0', 0.000002),
      ...Array.from({ length: 150 }, (_, i) =>
        makeSyscall(13 + i, ['read', 'write', 'epoll_wait', 'accept4', 'openat', 'close', 'fstat', 'mmap'][i % 8],
          ['4', '"..."', '4096'], i % 3 === 0 ? '0' : String(i % 100 + 1), Math.random() * 0.002)
      ),
    ],
  },
  bash: {
    weirdnessScore: 35,
    duration: 0.45,
    syscalls: [
      makeSyscall(1, 'execve', ['"/bin/bash"', '["bash"]', '0x7ffe...'], '0', 0.000234),
      makeSyscall(2, 'openat', ['AT_FDCWD', '"/etc/profile"', 'O_RDONLY'], '3', 0.000038),
      makeSyscall(3, 'read', ['3', '"# /etc/profile..."', '4096'], '245', 0.000012),
      makeSyscall(4, 'close', ['3'], '0', 0.000002),
      makeSyscall(5, 'openat', ['AT_FDCWD', '"/etc/bash.bashrc"', 'O_RDONLY'], '3', 0.000035),
      makeSyscall(6, 'read', ['3', '"# System-wide..."', '4096'], '892', 0.000015),
      makeSyscall(7, 'close', ['3'], '0', 0.000002),
      makeSyscall(8, 'rt_sigaction', ['SIGINT', '{sa_handler=0x...}', 'NULL', '8'], '0', 0.000003),
      makeSyscall(9, 'rt_sigaction', ['SIGTERM', '{sa_handler=0x...}', 'NULL', '8'], '0', 0.000003),
      makeSyscall(10, 'getcwd', ['"/home/user"', '4096'], '10', 0.000004),
      makeSyscall(11, 'stat', ['"/home/user/.bashrc"', '{st_mode=S_IFREG|0644, st_size=3526}'], '0', 0.000006),
      makeSyscall(12, 'openat', ['AT_FDCWD', '"/home/user/.bashrc"', 'O_RDONLY'], '3', 0.000034),
      makeSyscall(13, 'read', ['3', '"# ~/.bashrc..."', '4096'], '3526', 0.000018),
      makeSyscall(14, 'close', ['3'], '0', 0.000002),
      ...Array.from({ length: 60 }, (_, i) =>
        makeSyscall(15 + i, ['read', 'write', 'openat', 'close', 'stat', 'rt_sigaction'][i % 6],
          ['AT_FDCWD', '"..."', '4096'], i % 4 === 0 ? '0' : String(i % 50 + 1), Math.random() * 0.0001)
      ),
    ],
  },
  node: {
    weirdnessScore: 42,
    duration: 3.2,
    syscalls: [
      makeSyscall(1, 'execve', ['"/usr/bin/node"', '["node", "server.js"]', '0x7ffe...'], '0', 0.000234),
      ...Array.from({ length: 200 }, (_, i) =>
        makeSyscall(2 + i, ['openat', 'read', 'mmap', 'close', 'fstat', 'epoll_wait', 'connect', 'socket', 'stat', 'futex'][i % 10],
          ['AT_FDCWD', '"..."', '4096', 'PROT_READ'], i % 5 === 0 ? '0' : String(i % 100 + 1), Math.random() * 0.0005)
      ),
    ],
  },
};

export const PRECOMPUTED_PROGRAM_NAMES = Object.keys(PRECOMPUTED_TRACES);

export function getPrecomputedTrace(program: string) {
  if (PRECOMPUTED_TRACES[program]) {
    return PRECOMPUTED_TRACES[program];
  }

  // Generate a realistic fallback trace for ANY user-provided command
  const weirdnessScore = Math.floor(Math.random() * 40) + 5;
  const duration = Number((Math.random() * 2 + 0.1).toFixed(2));
  const syscalls = [
    makeSyscall(1, 'execve', [`"/usr/bin/${program}"`, `["${program}"]`, '0x7ffe...'], '0', 0.000234),
    makeSyscall(2, 'brk', ['NULL'], '0x55a7b2000000', 0.000002),
    ...Array.from({ length: Math.floor(Math.random() * 50) + 30 }, (_, i) =>
      makeSyscall(3 + i, ['openat', 'read', 'mmap', 'mprotect', 'fstat', 'close', 'stat'][i % 7],
        ['AT_FDCWD', '"..."', '4096'], i % 4 === 0 ? '0' : String(i % 100 + 1), Math.random() * 0.0002)
    ),
    makeSyscall(99, 'write', ['1', '"Output..."\\n', '10'], '10', 0.000012),
    makeSyscall(100, 'exit_group', ['0'], '', 0.000002),
  ];

  return { syscalls, weirdnessScore, duration };
}

// Generate realistic live strace lines for the terminal animation
export const DEMO_STRACE_LINES = [
  { text: 'execve("/bin/bash", ["bash"], 0x7ffe...) = 0', category: 'process' },
  { text: 'brk(NULL) = 0x55a7b2000000', category: 'memory' },
  { text: 'openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3', category: 'fileio' },
  { text: 'read(3, "\\177ELF\\2\\1\\1\\3\\0\\0\\0\\0\\0\\0\\0\\0"..., 832) = 832', category: 'fileio' },
  { text: 'mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f3a2c000000', category: 'memory' },
  { text: 'openat(AT_FDCWD, "/etc/resolv.conf", O_RDONLY|O_CLOEXEC) = 4', category: 'fileio' },
  { text: 'socket(AF_INET, SOCK_STREAM|SOCK_CLOEXEC, IPPROTO_TCP) = 5', category: 'network' },
  { text: 'connect(5, {sa_family=AF_INET, sin_port=htons(443)}, 16) = 0', category: 'network', badge: 'NETWORK' },
  { text: 'send(5, "\\x16\\x03\\x01\\x02\\0..."..., 517, MSG_NOSIGNAL) = 517', category: 'network' },
  { text: 'recv(5, "HTTP/1.1 200 OK\\r\\n..."..., 16384, 0) = 1256', category: 'network' },
  { text: 'fstat(3, {st_mode=S_IFREG|0644, st_size=47822}) = 0', category: 'fileio' },
  { text: 'mprotect(0x7f3a2c000000, 4096, PROT_READ) = 0', category: 'memory' },
  { text: 'execve("/bin/bash", ["bash"], 0x7ffe...) = 0', category: 'process', badge: '⚠ SUSPICIOUS' },
  { text: 'rt_sigaction(SIGINT, {sa_handler=0x4a8b20}, NULL, 8) = 0', category: 'signal' },
  { text: 'futex(0x7f3a2c123456, FUTEX_WAIT_PRIVATE, 0, NULL) = 0', category: 'ipc' },
  { text: 'write(1, "Hello, World!\\n", 14) = 14', category: 'fileio' },
  { text: 'close(3) = 0', category: 'fileio' },
  { text: 'exit_group(0) = ?', category: 'process' },
];
