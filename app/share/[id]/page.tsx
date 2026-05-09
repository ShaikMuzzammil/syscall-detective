import Link from 'next/link';
import { Share2, Eye } from 'lucide-react';

export default function SharePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-4 glass rounded-xl mb-6">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-accent-green" />
            <span className="text-sm font-mono text-text-primary">
              🔬 Shared Syscall Analysis
            </span>
            <span className="text-xs text-text-muted">· Shared 2h ago · 47 views</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Eye className="w-3.5 h-3.5" />
            Read-only view
          </div>
        </div>

        <div className="glass rounded-xl p-8 text-center mb-8">
          <div className="text-4xl mb-4">🔬</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Shared Analysis #{params.id}</h2>
          <p className="text-text-muted text-sm mb-6">
            This is a read-only shared view. Run your own analysis to get interactive results.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6 text-center">
            <div className="bg-bg-card rounded-lg p-3">
              <div className="text-xl font-bold font-mono text-accent-green">4,832</div>
              <div className="text-xs text-text-muted">Syscalls</div>
            </div>
            <div className="bg-bg-card rounded-lg p-3">
              <div className="text-xl font-bold font-mono text-accent-green">23</div>
              <div className="text-xs text-text-muted">Weirdness</div>
            </div>
            <div className="bg-bg-card rounded-lg p-3">
              <div className="text-xl font-bold font-mono text-text-primary">0.34s</div>
              <div className="text-xs text-text-muted">Duration</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">Run your own analysis →</p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-green text-bg-primary font-bold rounded-xl hover:bg-accent-green/90 transition-all"
          >
            Launch Syscall Detective
          </Link>
        </div>
      </div>
    </div>
  );
}
