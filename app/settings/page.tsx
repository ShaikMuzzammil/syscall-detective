'use client';

import { useEffect, useRef, useState } from 'react';
import type { ElementType, FormEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  CircleAlert,
  Loader2,
  Mail,
  Moon,
  Palette,
  RefreshCw,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Sliders,
  Sun,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_EMAIL = '';
const PREFS_KEY = 'syscall-detective-settings';
const THEME_KEY = 'syscall-detective-theme';
const CONTACT_HISTORY_KEY = 'syscall-detective-contact-history';

type Theme = 'dark' | 'light';

type Preferences = {
  theme: Theme;
  reportRecipient: string;
  notifyReports: boolean;
  notifyContacts: boolean;
  notifySecurity: boolean;
  notifyDigest: boolean;
  autoEmailReports: boolean;
  saveContactHistory: boolean;
  compactMode: boolean;
  reducedMotion: boolean;
};

type ContactEntry = {
  id: string;
  name: string;
  email: string;
  message: string;
  sentAt: string;
};

type MailStatus = {
  resendConfigured: boolean;
  fromEmail: string | null;
  notificationEmail: string | null;
  contactEmail: string | null;
  error?: string;
};

const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  reportRecipient: DEFAULT_EMAIL,
  notifyReports: true,
  notifyContacts: true,
  notifySecurity: true,
  notifyDigest: false,
  autoEmailReports: true,
  saveContactHistory: true,
  compactMode: false,
  reducedMotion: false,
};

// ─── sub-components ──────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ElementType;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 scroll-mt-24"
    >
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-accent-green" />
        </div>
        <div>
          <h2 className="font-semibold text-text-primary">{title}</h2>
          <p className="text-sm text-text-muted mt-1">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.section>
  );
}

function Toggle({
  checked,
  label,
  detail,
  onChange,
}: {
  checked: boolean;
  label: string;
  detail: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-bg-card/70 px-4 py-3 cursor-pointer hover:border-accent-green/30 transition-colors">
      <span>
        <span className="block text-sm font-medium text-text-primary">{label}</span>
        <span className="block text-xs text-text-muted mt-0.5">{detail}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-accent-green"
      />
    </label>
  );
}

/** Pulsing dot to indicate live / real-time status */
function LiveDot({ ok }: { ok: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1">
      {ok && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60" />
      )}
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ok ? 'bg-accent-green' : 'bg-danger-red'}`}
      />
    </span>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [contactHistory, setContactHistory] = useState<ContactEntry[]>([]);
  const [mailStatus, setMailStatus] = useState<MailStatus | null>(null);
  const [mailLoading, setMailLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: DEFAULT_EMAIL,
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const statusPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── handle client-side mounting ─────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── load saved prefs ────────────────────────────────────────────────────
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedPrefs = localStorage.getItem(PREFS_KEY);
      const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
      const savedHistory = localStorage.getItem(CONTACT_HISTORY_KEY);

      try {
        if (savedPrefs) {
          setPrefs({
            ...DEFAULT_PREFERENCES,
            ...JSON.parse(savedPrefs),
            theme: savedTheme ?? DEFAULT_PREFERENCES.theme,
          });
        } else if (savedTheme) {
          setPrefs((current) => ({ ...current, theme: savedTheme }));
        }

        if (savedHistory) {
          setContactHistory(JSON.parse(savedHistory));
        }
      } catch {
        localStorage.removeItem(PREFS_KEY);
        localStorage.removeItem(CONTACT_HISTORY_KEY);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // ── poll mail status every 10 s for real-time feedback ─────────────────
  const fetchMailStatus = async () => {
    try {
      const res = await fetch('/api/email/status');
      if (!res.ok) return;
      setMailStatus(await res.json());
    } catch {
      // network error — leave previous state
    } finally {
      setMailLoading(false);
    }
  };

  useEffect(() => {
    fetchMailStatus();
    statusPollRef.current = setInterval(fetchMailStatus, 10_000);
    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, []);

  // ── helpers ─────────────────────────────────────────────────────────────
  const updatePrefs = (next: Partial<Preferences>) => {
    setPrefs((current) => ({ ...current, ...next }));
  };

  const applyTheme = (theme: Theme) => {
    updatePrefs({ theme });
    localStorage.setItem(THEME_KEY, theme);
    window.dispatchEvent(new CustomEvent('syscall-theme-change', { detail: theme }));
  };

  const savePreferences = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    localStorage.setItem(THEME_KEY, prefs.theme);
    window.dispatchEvent(new CustomEvent('syscall-theme-change', { detail: prefs.theme }));
    toast.success('Settings saved');
  };

  const sendContactMessage = async (event: FormEvent) => {
    event.preventDefault();

    if (!contactForm.name.trim() || !contactForm.email.includes('@') || !contactForm.message.trim()) {
      toast.error('Enter your name, a valid email, and a message');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || 'Failed to send contact message');

      const entry: ContactEntry = {
        id: crypto.randomUUID(),
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        sentAt: new Date().toISOString(),
      };
      const nextHistory = [entry, ...contactHistory].slice(0, 8);

      if (prefs.saveContactHistory) {
        setContactHistory(nextHistory);
        localStorage.setItem(CONTACT_HISTORY_KEY, JSON.stringify(nextHistory));
      }

      setContactForm((current) => ({ ...current, message: '' }));
      const destination = mailStatus?.contactEmail ?? DEFAULT_EMAIL;
      toast.success(payload?.message || `Message sent to ${destination}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Message could not be sent');
    } finally {
      setSending(false);
    }
  };

  const clearContactHistory = () => {
    setContactHistory([]);
    localStorage.removeItem(CONTACT_HISTORY_KEY);
    toast.success('Contact history cleared');
  };

  // ── derived values ──────────────────────────────────────────────────────
  const isConfigured = mailStatus?.resendConfigured ?? false;
  const reportInbox = mailStatus?.notificationEmail ?? DEFAULT_EMAIL;
  const contactInbox = mailStatus?.contactEmail ?? DEFAULT_EMAIL;

  return (
    <div className="settings-circuit-bg min-h-screen bg-bg-primary pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="font-mono text-xs tracking-widest text-accent-green mb-2">CONTROL CENTER</p>
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary mt-2 max-w-2xl">
              Manage theme, notifications, report delivery, and contact messages.
              All emails route to <span className="font-mono text-accent-green">{reportInbox}</span> by default.
            </p>
          </div>
          <button
            onClick={savePreferences}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent-green text-bg-primary font-bold rounded-xl hover:bg-accent-green/90 transition-all text-sm"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-5">
          {/* ── left column ── */}
          <div className="space-y-5">
            {/* Appearance */}
            <Section
              icon={Palette}
              title="Appearance"
              description="Switch between the terminal dark interface and a high-contrast light mode."
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { value: 'dark' as const, label: 'Dark', icon: Moon },
                  { value: 'light' as const, label: 'Light', icon: Sun },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => applyTheme(value)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all ${
                      prefs.theme === value
                        ? 'border-accent-green/40 bg-accent-green/10 text-accent-green'
                        : 'border-white/10 bg-bg-card text-text-secondary hover:text-text-primary hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>
                      <span className="block text-sm font-semibold">{label} mode</span>
                      <span className="block text-xs opacity-75 mt-0.5">
                        {value === 'dark' ? 'Kernel-lab contrast' : 'Clean daylight workspace'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <Toggle
                checked={prefs.compactMode}
                label="Compact analyzer panels"
                detail="Save denser analyzer layout preference for future UI panels."
                onChange={(checked) => updatePrefs({ compactMode: checked })}
              />
              <Toggle
                checked={prefs.reducedMotion}
                label="Reduce motion"
                detail="Store a calmer animation preference for interface effects."
                onChange={(checked) => updatePrefs({ reducedMotion: checked })}
              />
            </Section>

            {/* Notifications */}
            <Section
              icon={Bell}
              title="Notifications"
              description="Choose which events should be tracked as notification preferences."
            >
              <Toggle
                checked={prefs.notifyReports}
                label="Analysis report emails"
                detail={`Send finished report notifications to ${reportInbox}.`}
                onChange={(checked) => updatePrefs({ notifyReports: checked })}
              />
              <Toggle
                checked={prefs.notifyContacts}
                label="Contact form messages"
                detail={`Keep contact submissions routed to ${contactInbox}.`}
                onChange={(checked) => updatePrefs({ notifyContacts: checked })}
              />
              <Toggle
                checked={prefs.notifySecurity}
                label="High-risk syscall alerts"
                detail="Prioritize suspicious behavior and security scoring alerts."
                onChange={(checked) => updatePrefs({ notifySecurity: checked })}
              />
              <Toggle
                checked={prefs.notifyDigest}
                label="Weekly digest"
                detail="Save preference for a weekly syscall research summary."
                onChange={(checked) => updatePrefs({ notifyDigest: checked })}
              />
            </Section>

            {/* Delivery */}
            <Section
              icon={Mail}
              title="Email Delivery"
              description="All reports and contact messages are sent to your default inbox. You can optionally route reports to an additional address."
            >
              {/* Live Resend status badge */}
              <div
                className={`rounded-xl border p-4 transition-colors ${
                  mailLoading
                    ? 'border-white/10 bg-bg-card/50'
                    : isConfigured
                    ? 'border-accent-green/20 bg-accent-green/5'
                    : 'border-danger-red/20 bg-danger-red/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  {mailLoading ? (
                    <Loader2 className="w-5 h-5 text-text-muted mt-0.5 animate-spin" />
                  ) : isConfigured ? (
                    <LiveDot ok />
                  ) : (
                    <LiveDot ok={false} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text-primary">
                        {mailLoading
                          ? 'Checking email config…'
                          : isConfigured
                          ? 'Resend is live — emails will be delivered'
                          : 'Resend API key missing — emails are blocked'}
                      </p>
                      <button
                        onClick={() => { setMailLoading(true); fetchMailStatus(); }}
                        className="text-text-muted hover:text-accent-green transition-colors shrink-0"
                        title="Refresh status"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {mailStatus?.error && (
                      <p className="text-xs text-danger-red mt-1 font-mono">{mailStatus.error}</p>
                    )}
                    {!mailLoading && (
                      <>
                        <p className="text-xs text-text-muted mt-2">
                          Sender:{' '}
                          <span className="font-mono text-text-secondary">
                            {mailStatus?.fromEmail ?? '—'}
                          </span>
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          Report inbox:{' '}
                          <span className="font-mono text-accent-green">{reportInbox}</span>
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          Contact inbox:{' '}
                          <span className="font-mono text-accent-green">{contactInbox}</span>
                        </p>
                      </>
                    )}
                    {!isConfigured && !mailLoading && (
                      <p className="text-xs text-danger-red/80 mt-2">
                        Add <span className="font-mono">RESEND_API_KEY</span> to{' '}
                        <span className="font-mono">.env.local</span> and restart the dev server.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Default recipient display */}
              <div className="rounded-xl border border-accent-green/20 bg-accent-green/10 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-accent-green mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Default report recipient</p>
                    <p className="font-mono text-sm text-accent-green mt-1">{reportInbox}</p>
                    <p className="text-xs text-text-muted mt-2">
                      Every report always lands here, even if an additional recipient is set below.
                    </p>
                  </div>
                </div>
              </div>

            </Section>
          </div>

          {/* ── right column ── */}
          <div className="space-y-5">
            {/* Contact Me */}
            <Section
              icon={Send}
              title="Contact Me"
              description={`Enter name, email, and details. Your message goes directly to ${contactInbox}.`}
            >
              <form onSubmit={sendContactMessage} className="space-y-3">
                <input
                  value={contactForm.name}
                  onChange={(event) =>
                    setContactForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green/40 outline-none"
                />
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(event) =>
                    setContactForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Your email (for reply)"
                  className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-sm font-mono text-text-primary placeholder:text-text-muted focus:border-accent-green/40 outline-none"
                />
                <textarea
                  value={contactForm.message}
                  onChange={(event) =>
                    setContactForm((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="Message details…"
                  rows={5}
                  className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green/40 outline-none resize-none"
                />

                {/* Real-time status hint */}
                <div
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                    isConfigured
                      ? 'border-accent-green/20 bg-accent-green/5 text-accent-green'
                      : 'border-danger-red/20 bg-danger-red/5 text-danger-red'
                  }`}
                >
                  {mailLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : isConfigured ? (
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <CircleAlert className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>
                    {mailLoading
                      ? 'Checking mail config…'
                      : isConfigured
                      ? `Will deliver to ${contactInbox}`
                      : 'Email is not configured — set RESEND_API_KEY'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!mounted || sending || !isConfigured}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent-green text-bg-primary font-bold rounded-xl hover:bg-accent-green/90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Settings2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </Section>

            {/* Saved Contact Log */}
            <Section
              icon={Sliders}
              title="Saved Contact Log"
              description="Recent contact messages are saved locally in this browser."
            >
              <Toggle
                checked={prefs.saveContactHistory}
                label="Save contact messages"
                detail="Keep the last eight messages here for quick review."
                onChange={(checked) => updatePrefs({ saveContactHistory: checked })}
              />

              {contactHistory.length ? (
                <div className="space-y-3">
                  {contactHistory.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-white/10 bg-bg-card/70 p-3">
                      <div className="flex items-center gap-2 text-xs text-accent-green font-mono">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {new Date(entry.sentAt).toLocaleString()}
                      </div>
                      <p className="text-sm font-semibold text-text-primary mt-2">{entry.name}</p>
                      <p className="text-xs text-text-muted font-mono mt-1">{entry.email}</p>
                      <p className="text-xs text-text-secondary mt-2 line-clamp-3">{entry.message}</p>
                    </div>
                  ))}
                  <button
                    onClick={clearContactHistory}
                    className="inline-flex items-center gap-2 text-xs text-danger-red hover:text-danger-red/80"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear saved messages
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-text-muted">
                  No saved contact messages yet.
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
