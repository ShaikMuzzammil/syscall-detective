'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, Settings2, BarChart3 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: Target,
    title: 'SELECT OR UPLOAD',
    description: 'Choose a program from our library or upload your own ELF binary or script. No terminal expertise required.',
    color: '#00FF88',
  },
  {
    step: '02',
    icon: Settings2,
    title: 'SANDBOX ANALYSIS',
    description: 'We run strace in an isolated Docker container with full syscall capture — safe, fast, and reproducible.',
    color: '#7C3AED',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'RESULTS DASHBOARD',
    description: 'Get call graphs, histograms, AI explanation, weirdness score, latency breakdown, and more.',
    color: '#3B82F6',
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="text-accent-green font-mono text-sm mb-3 tracking-widest">HOW IT WORKS</div>
          <h2 className="text-4xl font-bold text-text-primary">From Binary to Insight in Seconds</h2>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connecting line */}
          <div className="absolute top-[72px] left-[16.67%] right-[16.67%] h-px hidden md:block">
            <svg width="100%" height="4" className="overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00FF88" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <line x1="0" y1="2" x2="100%" y2="2" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="6,4" />
              {/* Animated dot */}
              <circle r="4" fill="#00FF88" opacity="0.8">
                <animateMotion dur="3s" repeatCount="indefinite" path="M0,2 L100%,2" />
              </circle>
            </svg>
          </div>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative glass rounded-xl p-6 card-hover"
              >
                {/* Step number */}
                <div
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold text-bg-primary"
                  style={{ backgroundColor: step.color, boxShadow: `0 0 12px ${step.color}60` }}
                >
                  {step.step}
                </div>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}30` }}
                >
                  <Icon className="w-7 h-7" style={{ color: step.color }} />
                </div>

                <h3 className="font-mono font-bold text-sm tracking-widest mb-3" style={{ color: step.color }}>
                  {step.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
