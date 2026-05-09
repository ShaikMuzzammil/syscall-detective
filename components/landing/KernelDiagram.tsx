'use client';
import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const LAYERS = [
  {
    id: 'userprogram',
    label: 'User Program',
    sublabel: 'Your application code',
    color: '#00FF88',
    tooltip: 'Your application runs in user space with restricted privileges. It cannot directly access hardware or kernel memory.',
  },
  {
    id: 'glibc',
    label: 'glibc / libc wrapper',
    sublabel: 'C standard library',
    color: '#3B82F6',
    tooltip: 'The C standard library provides wrapper functions around syscalls, handling architecture-specific details and error codes.',
  },
  {
    id: 'syscall',
    label: 'Syscall Interface',
    sublabel: 'INT 0x80 / SYSCALL instruction',
    color: '#7C3AED',
    tooltip: 'The syscall interface is the boundary between user space and kernel space. Every function call that requires OS services crosses here.',
  },
  {
    id: 'kernel',
    label: 'Linux Kernel',
    sublabel: 'Kernel space — privileged mode',
    color: '#F59E0B',
    tooltip: 'The Linux kernel runs in privileged mode and handles all hardware interactions, process scheduling, memory management, and security.',
  },
  {
    id: 'vfs',
    label: 'VFS (Virtual File System)',
    sublabel: 'Unified filesystem abstraction',
    color: '#EC4899',
    tooltip: 'The VFS layer abstracts all filesystem types (ext4, tmpfs, proc, etc.) behind a common interface, enabling transparent access.',
  },
  {
    id: 'drivers',
    label: 'Device Drivers',
    sublabel: 'Hardware abstraction layer',
    color: '#14B8A6',
    tooltip: 'Device drivers translate generic kernel operations into hardware-specific commands for network cards, storage devices, and peripherals.',
  },
  {
    id: 'hardware',
    label: 'Hardware',
    sublabel: 'Physical CPU, memory, disk, network',
    color: '#6B7280',
    tooltip: 'The physical hardware executes instructions and performs I/O operations as directed by device drivers and the kernel.',
  },
];

export default function KernelDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [tooltip, setTooltip] = useState<string | null>(null);

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <div className="text-accent-green font-mono text-sm mb-3 tracking-widest">LEARN</div>
          <h2 className="text-4xl font-bold text-text-primary">The Linux Call Stack</h2>
          <p className="text-text-secondary mt-3">Click any layer to understand what happens at each level</p>
        </motion.div>

        <div className="relative flex flex-col gap-1.5">
          {/* Animated packet dot */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,255,136,0.2), transparent)' }}>
            <div
              className="absolute left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-accent-green"
              style={{
                boxShadow: '0 0 8px rgba(0,255,136,0.8)',
                animation: 'moveDown 2s ease-in-out infinite',
              }}
            />
          </div>

          <style>{`
            @keyframes moveDown {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>

          {LAYERS.map((layer, i) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              onClick={() => setTooltip(tooltip === layer.id ? null : layer.id)}
              className="relative cursor-pointer rounded-xl border transition-all duration-200 select-none"
              style={{
                backgroundColor: `${layer.color}08`,
                borderColor: tooltip === layer.id ? layer.color : `${layer.color}30`,
                boxShadow: tooltip === layer.id ? `0 0 20px ${layer.color}20` : 'none',
              }}
            >
              <div className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: layer.color, boxShadow: `0 0 8px ${layer.color}60` }}
                />
                <div className="flex-1">
                  <div className="font-mono font-semibold text-sm" style={{ color: layer.color }}>
                    {layer.label}
                  </div>
                  <div className="text-xs text-text-muted">{layer.sublabel}</div>
                </div>
                <div className="text-xs text-text-muted font-mono">
                  {tooltip === layer.id ? '▲' : '▼'}
                </div>
              </div>

              {tooltip === layer.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-5 pb-4"
                >
                  <p className="text-sm text-text-secondary leading-relaxed border-t border-white/10 pt-3">
                    {layer.tooltip}
                  </p>
                </motion.div>
              )}

              {i < LAYERS.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <span className="text-text-muted text-xs font-mono">↓</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-text-muted mt-8"
        >
          Syscall Detective traces every interaction at the syscall boundary in real-time
        </motion.p>
      </div>
    </section>
  );
}
