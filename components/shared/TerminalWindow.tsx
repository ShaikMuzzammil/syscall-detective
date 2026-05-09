'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

interface TerminalLine {
  text: string;
  category?: string;
  badge?: string;
}

interface Props {
  lines: TerminalLine[];
  outputLines?: string[];
  speed?: number;
  loop?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  fileio: '#3B82F6',
  network: '#F59E0B',
  process: '#EF4444',
  memory: '#8B5CF6',
  signal: '#EC4899',
  ipc: '#14B8A6',
  default: '#00FF88',
};

export default function TerminalWindow({ lines, outputLines, speed = 80, loop = true, className = '' }: Props) {
  const [view, setView] = useState<'strace' | 'output'>('strace');
  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;

    if (currentIndex >= lines.length) {
      if (loop) {
        const resetTimer = setTimeout(() => {
          setVisibleLines([]);
          setCurrentIndex(0);
        }, 2000);
        return () => clearTimeout(resetTimer);
      }
      return;
    }

    const timer = setTimeout(() => {
      setVisibleLines(prev => [...prev.slice(-20), lines[currentIndex]]);
      setCurrentIndex(i => i + 1);
    }, speed + Math.random() * 40);

    return () => clearTimeout(timer);
  }, [currentIndex, lines, loop, speed, isPaused]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div className={`bg-bg-secondary border border-white/10 rounded-xl overflow-hidden flex flex-col ${className}`}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-bg-card border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex items-center gap-3 ml-4 h-full pt-1">
          <button
            onClick={() => setView('strace')}
            className={`text-xs font-mono pb-1 border-b-2 transition-colors ${
              view === 'strace' ? 'text-accent-green border-accent-green' : 'text-text-muted border-transparent hover:text-text-primary'
            }`}
          >
            strace log
          </button>
          <button
            onClick={() => setView('output')}
            className={`text-xs font-mono pb-1 border-b-2 transition-colors ${
              view === 'output' ? 'text-accent-green border-accent-green' : 'text-text-muted border-transparent hover:text-text-primary'
            }`}
          >
            stdout
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-bg-primary border border-white/10 hover:border-accent-green/50 hover:text-accent-green transition-colors text-text-muted"
            title={isPaused ? "Resume execution" : "Pause execution"}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span className="text-[10px] uppercase font-bold tracking-wider">{isPaused ? 'Play' : 'Stop'}</span>
          </button>
          
          <div className="flex items-center gap-1.5 w-12 justify-end">
            {!isPaused && <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />}
            <span className={`text-xs font-mono transition-colors ${isPaused ? 'text-text-muted' : 'text-accent-green'}`}>
              {isPaused ? 'PAUSED' : 'LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={containerRef}
        className="p-4 h-64 overflow-y-auto font-mono text-xs leading-relaxed"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {view === 'strace' ? (
          <>
            <AnimatePresence mode="popLayout">
              {visibleLines.map((line, i) => {
                const color = line.category ? CATEGORY_COLORS[line.category] : CATEGORY_COLORS.default;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex items-baseline gap-2 py-0.5"
                  >
                    <span className="text-text-muted text-[10px] select-none w-8 shrink-0">
                      {String(i + 1).padStart(3, ' ')}
                    </span>
                    <span style={{ color }} className="break-all">
                      {line.text}
                    </span>
                    {line.badge && (
                      <span
                        className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded"
                        style={{
                          backgroundColor: line.badge.includes('SUSPICIOUS') ? '#FF444420' : '#F59E0B20',
                          color: line.badge.includes('SUSPICIOUS') ? '#FF4444' : '#F59E0B',
                          border: `1px solid ${line.badge.includes('SUSPICIOUS') ? '#FF444440' : '#F59E0B40'}`,
                        }}
                      >
                        {line.badge}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div className="flex items-baseline gap-2 py-0.5">
              <span className="text-text-muted text-[10px] w-8 shrink-0" />
              <span className="text-accent-green">
                $ <span className="inline-block w-2 h-3 bg-accent-green cursor-blink ml-0.5" />
              </span>
            </div>
          </>
        ) : (
          <div className="text-text-primary whitespace-pre-wrap">
            {outputLines?.length ? outputLines.join('\n') : 'No output.'}
          </div>
        )}
      </div>
    </div>
  );
}
