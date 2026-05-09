'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Play, Circle } from 'lucide-react';
import TerminalWindow from '../shared/TerminalWindow';
import { DEMO_STRACE_LINES } from '@/lib/precomputed-traces';

const TYPEWRITER_TEXT = "What Is Your Program\nReally Doing?";
const SUBHEADLINE = "Syscall Detective reverse-engineers any Linux binary through real strace data, AI analysis, and live kernel visualization. No source code required.";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; opacity: number;
    }[] = [];

    const colors = ['#00FF88', '#7C3AED', '#3B82F6', '#F59E0B'];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrame = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

function TypewriterText() {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'done'>('typing');
  const lines = TYPEWRITER_TEXT.split('\n');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(TYPEWRITER_TEXT.slice(0, i));
      i++;
      if (i > TYPEWRITER_TEXT.length) {
        setPhase('done');
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-text-primary">
      {lines.map((line, li) => {
        const displayedChars = text.length;
        let charsBeforeLine = 0;
        for (let i = 0; i < li; i++) charsBeforeLine += lines[i].length + 1;
        const lineText = text.slice(charsBeforeLine, charsBeforeLine + line.length);

        return (
          <span key={li} className="block">
            {li === 1 ? (
              <span className="gradient-text">{lineText}</span>
            ) : lineText}
            {phase !== 'done' && li === Math.floor(displayedChars / (lines[0].length + 1)) && (
              <span className="text-accent-green cursor-blink">|</span>
            )}
          </span>
        );
      })}
    </h1>
  );
}

export default function Hero() {
  const [showSub, setShowSub] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowSub(true), 2600);
    const t2 = setTimeout(() => setShowCTA(true), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section id="overview" className="relative min-h-screen flex items-center overflow-hidden hero-gradient scanlines scroll-mt-24">
      <ParticleCanvas />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                v2.0 - Now with syscall intelligence
              </div>
            </motion.div>

            <TypewriterText />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showSub ? 1 : 0, y: showSub ? 0 : 20 }}
              transition={{ duration: 0.6 }}
              className="text-lg text-text-secondary leading-relaxed max-w-xl"
            >
              {SUBHEADLINE}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showCTA ? 1 : 0, y: showCTA ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/analyze"
                className="flex items-center gap-2 px-6 py-3.5 bg-accent-green text-bg-primary font-bold rounded-xl hover:bg-accent-green/90 transition-all pulse-green-btn text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Detective
              </Link>
              <Link
                href="#demo"
                className="flex items-center gap-2 px-6 py-3.5 bg-white/5 text-text-primary font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
              >
                <Circle className="w-4 h-4 text-accent-purple" />
                Watch 90s Demo
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showCTA ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 text-sm text-text-muted"
            >
              {[
                { value: '2,400+', label: 'developers' },
                { value: '180,000', label: 'syscalls analyzed' },
                { value: 'Open Source', label: 'core' },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="font-semibold text-text-secondary">{item.value}</span>
                  <span>{item.label}</span>
                  {i < 2 && <span className="text-text-muted/40 ml-2">·</span>}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-accent-green/5 rounded-2xl blur-xl" />
            <TerminalWindow
              lines={DEMO_STRACE_LINES as { text: string; category?: string; badge?: string }[]}
              outputLines={[
                'Resolving target host... done.',
                'Connecting to 93.184.216.34:443... connected.',
                'HTTP request sent, awaiting response... 200 OK',
                'Length: 1256 (1.2K) [text/html]',
                'Saving to: \'STDOUT\'',
                '',
                ' 0K .                                                     100% 1.2M=0.001s',
                '',
                '[WARNING] Secondary payload execution triggered',
                'bash: initializing environment...',
                'Hello, World!',
                '',
                'Program exited with status 0.'
              ]}
              speed={120}
              loop={false}
              className="relative"
            />
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-purple/10 rounded-full blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
