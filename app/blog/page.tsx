import Link from 'next/link';
import Footer from '@/components/landing/Footer';

const POSTS = [
  { slug: 'how-read-works', title: 'How read() Really Works: From Syscall to Disk and Back', category: 'Linux Internals', readTime: 12, date: 'May 2025', featured: true, desc: 'A deep dive into what happens when your program calls read() — from the C wrapper all the way down to the storage driver.' },
  { slug: 'npm-stat-calls', title: 'Why npm install makes 40,000 stat() calls', category: 'Performance', readTime: 8, date: 'Apr 2025', desc: 'We traced npm install and found something surprising about how it resolves modules.' },
  { slug: 'syscall-malware', title: 'Detecting Malware via Syscall Fingerprinting', category: 'Security', readTime: 15, date: 'Apr 2025', desc: 'Certain syscall sequences reliably identify malicious behavior. Here\'s how we built our detection rules.' },
  { slug: 'nodejs-io-cost', title: 'The Hidden Cost of file I/O in Node.js', category: 'Performance', readTime: 10, date: 'Mar 2025', desc: 'Why your Node.js app might be making hundreds of unnecessary filesystem calls.' },
  { slug: 'chrome-firefox-kernel', title: 'How Chrome and Firefox Differ at the Kernel Level', category: 'Research', readTime: 18, date: 'Mar 2025', desc: 'We ran both browsers under strace and compared 10,000+ syscalls. The differences are fascinating.' },
  { slug: 'mmap-explained', title: 'Understanding mmap: Memory-Mapped Files Explained', category: 'Linux Internals', readTime: 11, date: 'Feb 2025', desc: 'mmap() is one of the most powerful and misunderstood syscalls. This is your complete guide.' },
  { slug: 'ptrace-strace', title: 'ptrace: The Syscall That Makes strace Possible', category: 'Linux Internals', readTime: 14, date: 'Feb 2025', desc: 'How ptrace works, why it\'s powerful, and what security implications it has.' },
];

const CAT_COLORS: Record<string, string> = {
  'Linux Internals': '#3B82F6',
  Performance: '#F59E0B',
  Security: '#EF4444',
  Research: '#7C3AED',
};

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="text-accent-green font-mono text-sm mb-3 tracking-widest">TECHNICAL BLOG</div>
          <h1 className="text-4xl font-bold text-text-primary">Deep Dives into Linux Internals</h1>
          <p className="text-text-secondary mt-3">Security research, performance analysis, and OS fundamentals</p>
        </div>

        {featured && (
          <Link href={`/blog/${featured.slug}`} className="block glass rounded-2xl p-8 mb-8 card-hover">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold" style={{ color: CAT_COLORS[featured.category] || '#888', background: `${CAT_COLORS[featured.category]}15` }}>
                {featured.category}
              </span>
              <span className="text-xs text-text-muted">FEATURED</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">{featured.title}</h2>
            <p className="text-text-secondary mb-4">{featured.desc}</p>
            <div className="text-xs text-text-muted font-mono">{featured.readTime} min read · {featured.date}</div>
          </Link>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {rest.map((post, i) => (
            <Link key={i} href={`/blog/${post.slug}`} className="glass rounded-xl p-5 card-hover flex flex-col">
              <span className="px-2 py-0.5 rounded text-xs font-mono self-start mb-3" style={{ color: CAT_COLORS[post.category] || '#888', background: `${CAT_COLORS[post.category]}15` }}>
                {post.category}
              </span>
              <h3 className="font-semibold text-text-primary text-sm leading-snug mb-2 flex-1">{post.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">{post.desc}</p>
              <div className="text-[10px] text-text-muted font-mono">{post.readTime} min · {post.date}</div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
