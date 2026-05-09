import Link from 'next/link';
import { BookOpen, Database, GitBranch, Terminal, Shield, Zap } from 'lucide-react';

const SECTIONS = [
  { icon: Terminal, title: 'Getting Started', desc: 'Analyze your first program in 30 seconds', href: '/analyze', color: '#00FF88' },
  { icon: Database, title: 'Syscall Reference', desc: '400+ Linux syscalls documented', href: '/docs/syscalls', color: '#3B82F6' },
  { icon: GitBranch, title: 'API Reference', desc: 'REST API for programmatic access', href: '/docs', color: '#7C3AED' },
  { icon: Shield, title: 'Security Guide', desc: 'How we sandbox binaries safely', href: '/docs', color: '#EF4444' },
  { icon: Zap, title: 'Performance Analysis', desc: 'Find bottlenecks with latency graphs', href: '/analyze', color: '#F59E0B' },
  { icon: BookOpen, title: 'Blog', desc: 'Deep dives into Linux internals', href: '/blog', color: '#EC4899' },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="text-accent-green font-mono text-sm mb-3 tracking-widest">DOCUMENTATION</div>
          <h1 className="text-4xl font-bold text-text-primary">Syscall Detective Docs</h1>
          <p className="text-text-secondary mt-3">Everything you need to analyze, understand, and secure your programs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link key={i} href={s.href} className="glass rounded-xl p-5 card-hover flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{s.title}</h3>
                  <p className="text-sm text-text-muted mt-0.5">{s.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
