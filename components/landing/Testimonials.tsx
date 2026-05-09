'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "I found a npm package sending data to an unknown IP. Syscall Detective flagged it in 3 seconds.",
    author: "Arjun S.",
    role: "Security Researcher",
    avatar: "AS",
    color: "#00FF88",
  },
  {
    quote: "Used this to debug why our Node.js app had 40k unnecessary stat() calls on startup. Saved hours.",
    author: "Chen W.",
    role: "Senior Backend Engineer",
    avatar: "CW",
    color: "#3B82F6",
  },
  {
    quote: "Perfect for CTF reverse engineering challenges. I can understand binaries without a disassembler.",
    author: "Maria K.",
    role: "CTF Player",
    avatar: "MK",
    color: "#7C3AED",
  },
  {
    quote: "The AI explanations are uncannily accurate. It described exactly what my daemon was doing at the kernel level.",
    author: "Alex T.",
    role: "Linux Kernel Developer",
    avatar: "AT",
    color: "#F59E0B",
  },
  {
    quote: "I use Syscall Detective in every code review for security-critical code paths. It's become indispensable.",
    author: "Sam R.",
    role: "AppSec Engineer",
    avatar: "SR",
    color: "#EC4899",
  },
];

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused]);

  const prev = () => setCurrent(c => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent(c => (c + 1) % TESTIMONIALS.length);

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <div className="text-accent-green font-mono text-sm mb-3 tracking-widest">TESTIMONIALS</div>
          <h2 className="text-4xl font-bold text-text-primary">What Developers Are Saying</h2>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-2xl p-8 md:p-12"
            >
              <Quote
                className="w-8 h-8 mb-6 opacity-30"
                style={{ color: TESTIMONIALS[current].color }}
              />
              <p className="text-xl md:text-2xl text-text-primary font-medium leading-relaxed mb-8">
                &quot;{TESTIMONIALS[current].quote}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-mono text-bg-primary"
                  style={{ backgroundColor: TESTIMONIALS[current].color }}
                >
                  {TESTIMONIALS[current].avatar}
                </div>
                <div>
                  <div className="font-semibold text-text-primary">{TESTIMONIALS[current].author}</div>
                  <div className="text-sm text-text-muted">{TESTIMONIALS[current].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: i === current ? '#00FF88' : '#333',
                    transform: i === current ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-text-secondary" />
              </button>
              <button
                onClick={next}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
