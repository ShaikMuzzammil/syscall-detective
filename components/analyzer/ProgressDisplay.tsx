'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import TerminalWindow from '../shared/TerminalWindow';
import { DEMO_STRACE_LINES, getPrecomputedTrace } from '@/lib/precomputed-traces';

const STEPS = [
  { label: 'Spawning Docker container...', delay: 0 },
  { label: 'Injecting strace tracer...', delay: 400 },
  { label: 'Running program...', delay: 700 },
  { label: 'Parsing syscall lines...', delay: 1100 },
  { label: 'Building call graph...', delay: 1500 },
  { label: 'Computing weirdness score...', delay: 1700 },
  { label: 'Generating AI explanation...', delay: 1900 },
  { label: 'Rendering visualizations...', delay: 2200 },
];

const OUTPUT_MAP: Record<string, string[]> = {
  ls: ['total 47', 'drwxrwxrwt 1 root root 4096 May 9 01:23 .', '-rw-r--r-- 1 user user  124 May 9 01:20 test.txt'],
  curl: ['HTTP/1.1 200 OK', 'Content-Type: text/html', '', '<!doctype html><html>...</html>'],
  python3: ['hello'],
  nginx: ['nginx: [warn] the "user" directive makes sense only if the master process runs with super-user privileges'],
  bash: ['user@system:~$ '],
  node: ['Server listening on port 3000'],
};

export default function ProgressDisplay({ program }: { program?: string }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setActiveStep(i);
        setProgress(Math.round(((i + 0.5) / STEPS.length) * 100));
      }, step.delay);
      timers.push(t);

      if (i < STEPS.length - 1) {
        const t2 = setTimeout(() => {
          setCompletedSteps(prev => [...prev, i]);
        }, STEPS[i + 1].delay - 50);
        timers.push(t2);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const trace = program ? getPrecomputedTrace(program) : null;
  const lines = trace ? trace.syscalls.slice(0, 25).map(s => ({
    text: s.rawLine,
    category: s.category,
    badge: ['execve', 'connect', 'bind', 'clone'].includes(s.name) ? '⚠ SUSPICIOUS' : undefined
  })) : DEMO_STRACE_LINES;

  const currentOutput = (program && OUTPUT_MAP[program]) || [
    `$ ${program || 'command'}`,
    `Initializing ${program || 'process'} environment...`,
    'Loading shared libraries [OK]',
    'Executing main routine...',
    '...',
    'Process finished successfully.',
    'Program exited with status 0.'
  ];

  return (
    <div className="glass rounded-xl p-6 space-y-6">
      <div>
        <h3 className="font-mono font-bold text-text-primary mb-1">Analysis in Progress</h3>
        <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent-green rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-right text-xs font-mono text-accent-green mt-1">{progress}%</div>
      </div>

      <div className="space-y-2.5">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.includes(i);
          const isActive = activeStep === i && !isDone;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 shrink-0">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-accent-green/20 border border-accent-green flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-accent-green" />
                  </motion.div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full border border-accent-yellow/50 flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-accent-yellow animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-white/20" />
                )}
              </div>
              <span
                className={`text-sm font-mono transition-colors ${
                  isDone ? 'text-text-muted line-through' :
                  isActive ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                Step {i + 1} — {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <TerminalWindow
        lines={lines as any}
        outputLines={currentOutput}
        speed={60}
        loop={false}
        className="mt-4"
      />
    </div>
  );
}
