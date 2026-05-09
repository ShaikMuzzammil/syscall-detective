'use client';

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2, Mail, Send } from 'lucide-react';

const OWNER_NAME = 'Host';

export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.includes('@') || !form.message.trim()) {
      setStatus('error');
      setErrorMsg('Enter your name, a valid email, and message details.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok) throw new Error(payload?.error || 'Failed to send message');

      setStatus('success');
      setForm((current) => ({ ...current, message: '' }));
    } catch (error) {
      setStatus('error');
      setErrorMsg(error instanceof Error ? error.message : 'Message could not be sent.');
    }
  };

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5 items-stretch"
        >
          <div className="glass rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,136,0.22),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.18),transparent_34%)]" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-accent-green" />
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-3">Contact Syscall Detective</h2>
              <p className="text-text-secondary leading-relaxed">
                Send feedback, report issues, or ask for a feature. Messages go directly to {OWNER_NAME}.
              </p>
            </div>
            <div className="relative mt-8 rounded-xl border border-white/10 bg-bg-card/70 p-4">
              <p className="font-mono text-xs text-text-muted">DEFAULT INBOX</p>
              <p className="font-mono text-sm text-accent-green mt-1">{OWNER_NAME}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-3">
            <input
              value={form.name}
              onChange={(event) => {
                setForm((current) => ({ ...current, name: event.target.value }));
                setStatus('idle');
              }}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green/40"
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }));
                setStatus('idle');
              }}
              placeholder="Your email"
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-sm font-mono text-text-primary placeholder:text-text-muted focus:border-accent-green/40"
            />
            <textarea
              value={form.message}
              onChange={(event) => {
                setForm((current) => ({ ...current, message: event.target.value }));
                setStatus('idle');
              }}
              placeholder="Message details"
              rows={6}
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green/40 resize-none"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-green text-bg-primary font-bold rounded-xl hover:bg-accent-green/90 transition-all disabled:opacity-70 text-sm"
            >
              {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-accent-green text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Message sent to {OWNER_NAME}.
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 text-danger-red text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
