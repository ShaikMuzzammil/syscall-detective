import Link from 'next/link';

const SYSCALL_DATA: Record<string, { number: number; category: string; signature: string; desc: string; args: { name: string; type: string; desc: string }[]; returns: string; security?: string; related: string[] }> = {
  openat: {
    number: 257, category: 'File I/O',
    signature: 'int openat(int dirfd, const char *pathname, int flags, mode_t mode)',
    desc: 'Opens the file specified by pathname. Similar to open() but relative to a directory file descriptor dirfd.',
    args: [
      { name: 'dirfd', type: 'int', desc: 'Directory fd, or AT_FDCWD for current dir' },
      { name: 'pathname', type: 'char *', desc: 'Path to the file to open' },
      { name: 'flags', type: 'int', desc: 'O_RDONLY, O_WRONLY, O_CREAT, O_TRUNC...' },
      { name: 'mode', type: 'mode_t', desc: 'File permission bits (if creating)' },
    ],
    returns: 'Success: New file descriptor (≥ 0). Error: -1, errno set.',
    security: '⚠ Opening /etc/passwd, /etc/shadow, or /proc/*/maps may indicate credential harvesting. Syscall Detective flags these automatically.',
    related: ['open', 'close', 'read', 'write', 'stat'],
  },
};

export default function SyscallDetailPage({ params }: { params: { name: string } }) {
  const data = SYSCALL_DATA[params.name] || {
    number: 0, category: 'Misc',
    signature: `${params.name}(...)`,
    desc: `System call: ${params.name}`,
    args: [],
    returns: 'See man page for details.',
    related: [],
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-xs font-mono text-text-muted mb-6 flex gap-1">
          <Link href="/docs/syscalls" className="hover:text-text-primary">Syscalls</Link>
          <span>/</span>
          <span className="text-text-secondary">{params.name}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-3xl font-bold font-mono text-accent-green">{params.name}(2)</h1>
          <div className="flex gap-3 mt-2 text-xs text-text-muted font-mono">
            <span>Category: {data.category}</span>
            <span>·</span>
            <span>Syscall #: {data.number}</span>
            <span>·</span>
            <span>x86_64</span>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xs font-mono font-bold text-text-muted tracking-widest mb-3">SIGNATURE</h2>
            <pre className="bg-bg-card border border-white/10 rounded-xl p-4 text-sm font-mono text-accent-green overflow-x-auto">
              {data.signature}
            </pre>
          </section>

          <section>
            <h2 className="text-xs font-mono font-bold text-text-muted tracking-widest mb-3">DESCRIPTION</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{data.desc}</p>
          </section>

          {data.args.length > 0 && (
            <section>
              <h2 className="text-xs font-mono font-bold text-text-muted tracking-widest mb-3">ARGUMENTS</h2>
              <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {data.args.map((arg, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-4 py-3 font-mono text-accent-green w-24">{arg.name}</td>
                        <td className="px-4 py-3 font-mono text-accent-purple text-xs w-24">{arg.type}</td>
                        <td className="px-4 py-3 text-text-secondary text-xs">{arg.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xs font-mono font-bold text-text-muted tracking-widest mb-3">RETURN VALUE</h2>
            <p className="text-sm text-text-secondary font-mono">{data.returns}</p>
          </section>

          {data.security && (
            <section className="p-4 bg-warning-orange/5 border border-warning-orange/20 rounded-xl">
              <h2 className="text-xs font-mono font-bold text-warning-orange tracking-widest mb-2">SECURITY NOTES</h2>
              <p className="text-sm text-text-secondary">{data.security}</p>
            </section>
          )}

          {data.related.length > 0 && (
            <section>
              <h2 className="text-xs font-mono font-bold text-text-muted tracking-widest mb-3">RELATED SYSCALLS</h2>
              <div className="flex flex-wrap gap-2">
                {data.related.map(r => (
                  <Link key={r} href={`/docs/syscalls/${r}`} className="px-3 py-1.5 bg-bg-card border border-white/10 rounded-lg text-xs font-mono text-text-secondary hover:text-accent-green hover:border-accent-green/30 transition-colors">
                    {r}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="p-4 bg-accent-green/5 border border-accent-green/20 rounded-xl">
            <Link href={`/analyze?program=ls`} className="text-sm text-accent-green hover:underline font-mono">
              → Analyze a program using {params.name}()
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
