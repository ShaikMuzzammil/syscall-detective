import Link from 'next/link';
import { BookOpen, Code2, ExternalLink, Microscope } from 'lucide-react';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const LINKS: Record<string, FooterLink[]> = {
  Product: [
    { label: 'Analyzer', href: '/analyze' },
    { label: 'Compare', href: '/compare' },
    { label: 'Documentation', href: '/docs' },
    { label: 'Settings', href: '/settings' },
  ],
  Resources: [
    { label: 'Linux Syscalls', href: 'https://man7.org/linux/man-pages/man2/syscalls.2.html', external: true },
    { label: 'strace Project', href: 'https://strace.io/', external: true },
    { label: 'Linux Kernel Docs', href: 'https://www.kernel.org/doc/html/latest/', external: true },
    { label: 'Next.js Docs', href: 'https://nextjs.org/docs', external: true },
  ],
  Support: [
    { label: 'Contact', href: '/#contact' },
    { label: 'Syscall Reference', href: '/docs/syscalls' },
    { label: 'Blog', href: '/blog' },
    { label: 'Report Email Setup', href: '/settings' },
  ],
};

function FooterNavLink({ link }: { link: FooterLink }) {
  const className = 'text-sm text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1.5';

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-bg-secondary/50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/#overview" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
                <Microscope className="w-4 h-4 text-accent-green" />
              </div>
              <span className="font-mono font-bold text-text-primary text-sm tracking-tight">
                <span className="text-accent-green">SYSCALL</span> DETECTIVE
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed mb-6 max-w-xs">
              See what programs really do with syscall tracing, risk scoring, and interactive Linux runtime visualizations.
            </p>

            <div className="flex gap-3">
              {[
                { icon: Code2, href: 'https://github.com/strace/strace', label: 'strace GitHub' },
                { icon: BookOpen, href: 'https://man7.org/linux/man-pages/', label: 'Linux man-pages' },
                { icon: ExternalLink, href: 'https://www.kernel.org/', label: 'Linux kernel' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {['Next.js', 'strace', 'Linux kernel', 'syscall tracing'].map((tech) => (
                <span key={tech} className="text-[10px] font-mono px-2 py-1 bg-white/5 border border-white/10 rounded text-text-muted">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-mono text-xs font-bold text-text-muted tracking-widest mb-4">{category.toUpperCase()}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterNavLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted font-mono">
            Copyright 2026 Syscall Detective. Built for the Linux community.
          </p>
          <p className="text-xs text-text-muted font-mono">
            <span className="text-accent-green">[online]</span> Contact routes and analyzer routes online
          </p>
        </div>
      </div>
    </footer>
  );
}
