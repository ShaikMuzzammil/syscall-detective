'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import InputPanel from '@/components/analyzer/InputPanel';
import ProgressDisplay from '@/components/analyzer/ProgressDisplay';
import ResultsTabs from '@/components/analyzer/ResultsTabs';
import { AnalysisResult } from '@/lib/types';
import { getPrecomputedTrace } from '@/lib/precomputed-traces';
import { buildSummaryStats } from '@/lib/strace-parser';
import { computeWeirdnessScore } from '@/lib/weirdness-scorer';
import { buildCallGraph } from '@/lib/graph-builder';
import { generateId } from '@/lib/utils';

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingProg, setAnalyzingProg] = useState('ls');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const runAnalysis = async (program: string, command?: string) => {
    const prog = program || 'ls';
    setAnalyzingProg(prog);
    setAnalyzing(true);
    setResult(null);

    // Simulate analysis steps with pre-computed data
    await new Promise(r => setTimeout(r, 2500));
    const trace = getPrecomputedTrace(prog);

    if (trace) {
      const { score, rules } = computeWeirdnessScore(trace.syscalls);
      const graphData = buildCallGraph(trace.syscalls);

      // Try to get AI report from API
      let aiReport: string | undefined;
      try {
        const res = await fetch('/api/ai-explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ syscalls: trace.syscalls.slice(0, 50), program: prog, weirdnessScore: score }),
        });
        if (res.ok) {
          const data = await res.json();
          aiReport = data.report;
        }
      } catch {}

      setResult({
        id: generateId(),
        program: prog,
        command: command || `${prog}`,
        syscalls: trace.syscalls,
        graphData,
        weirdnessScore: score,
        weirdnessRules: rules,
        aiReport,
        totalCalls: trace.syscalls.length,
        uniqueCalls: buildSummaryStats(trace.syscalls).length,
        duration: trace.duration,
        shareId: generateId(),
        createdAt: new Date().toISOString(),
      });
    }

    setAnalyzing(false);
  };

  // Auto-analyze if program in URL
  useEffect(() => {
    const prog = searchParams.get('program');
    if (!prog) return;

    const timer = window.setTimeout(() => runAnalysis(prog), 0);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="text-xs font-mono text-text-muted mb-2 flex items-center gap-1">
            <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-text-secondary">Analyze</span>
          </nav>
          <h1 className="text-2xl font-bold text-text-primary">
            <span className="text-accent-green">$</span> Syscall Analyzer
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Trace system calls, visualize execution, detect suspicious behavior
          </p>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
          {/* Input Panel */}
          <div className="lg:sticky lg:top-24">
            <InputPanel onAnalyze={runAnalysis} loading={analyzing} />
          </div>

          {/* Results */}
          <div>
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProgressDisplay program={analyzingProg} />
                </motion.div>
              ) : result ? (
                <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <ResultsTabs result={result} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-xl p-16 text-center"
                >
                  <div className="text-6xl mb-4">🔬</div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Ready to Analyze</h3>
                  <p className="text-text-muted max-w-sm mx-auto">
                    Select a program or paste a command on the left, then click Analyze Now
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    {['ls', 'curl', 'python3'].map(prog => (
                      <button
                        key={prog}
                        onClick={() => runAnalysis(prog)}
                        className="py-2 px-3 bg-bg-card border border-white/10 rounded-lg text-xs font-mono text-text-secondary hover:text-accent-green hover:border-accent-green/30 transition-colors"
                      >
                        {prog}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary pt-20 flex items-center justify-center"><div className="text-accent-green font-mono">Loading...</div></div>}>
      <AnalyzeContent />
    </Suspense>
  );
}
