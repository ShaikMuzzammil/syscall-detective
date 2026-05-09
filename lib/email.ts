// Email integration using Resend.
// Set RESEND_API_KEY in .env.local to enable real email sends.
// NOTIFICATION_EMAIL  → default inbox for reports
// CONTACT_EMAIL       → inbox for contact form messages (falls back to NOTIFICATION_EMAIL)

import type { CreateEmailOptions } from 'resend';

const DEFAULT_APP_URL = 'https://syscalldetective.dev';
const DEFAULT_FROM_EMAIL = 'Syscall Detective <onboarding@resend.dev>';
const DEFAULT_NOTIFICATION_EMAIL = 'muzzammil160806@gmail.com';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ReportData {
  program: string;
  command?: string;
  weirdnessScore: number;
  totalCalls: number;
  duration: number;
  aiReport?: string;
  reportId: string;
  recipientEmail?: string;
  topSyscalls?: { name: string; count: number; percentage: number }[];
  suspiciousFlags?: string[];
}

export interface ContactMessageData {
  name?: string;
  email: string;
  message: string;
}

// ─── env helpers ────────────────────────────────────────────────────────────

function getEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getFromEmail(): string {
  return getEnv('RESEND_FROM_EMAIL') ?? DEFAULT_FROM_EMAIL;
}

export function getNotificationEmail(): string {
  return normalizeEmailAddress(
    getEnv('NOTIFICATION_EMAIL') ?? DEFAULT_NOTIFICATION_EMAIL,
    'notification',
  );
}

/** Contact form destination — falls back to NOTIFICATION_EMAIL */
export function getContactEmail(): string {
  const raw = getEnv('CONTACT_EMAIL') ?? getEnv('NOTIFICATION_EMAIL') ?? DEFAULT_NOTIFICATION_EMAIL;
  return normalizeEmailAddress(raw, 'contact');
}

export function isResendConfigured(): boolean {
  return Boolean(getEnv('RESEND_API_KEY'));
}

function getAppUrl(): string {
  const configuredUrl = getEnv('NEXT_PUBLIC_APP_URL') ?? DEFAULT_APP_URL;
  try {
    return new URL(configuredUrl).origin;
  } catch {
    return DEFAULT_APP_URL;
  }
}

function appUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getAppUrl()}${normalizedPath}`;
}

// ─── sanitisation helpers ────────────────────────────────────────────────────

function normalizeEmailAddress(email: string, label: string): string {
  const normalized = email.trim();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new Error(`[Email] Invalid ${label} email address: "${normalized}"`);
  }
  return normalized;
}

function sanitizeSubjectSegment(value: string, fallback = 'unknown'): string {
  const sanitized = value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  return (sanitized || fallback).slice(0, 140);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toSafeNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function formatInteger(value: number): string {
  return Math.max(0, Math.trunc(toSafeNumber(value))).toLocaleString('en-US');
}

function formatDuration(value: number): string {
  return Math.max(0, toSafeNumber(value)).toFixed(2);
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(toSafeNumber(value))));
}

function getRiskLevel(score: number): { label: string; color: string } {
  if (score <= 30) return { label: 'LOW RISK', color: '#00FF88' };
  if (score <= 60) return { label: 'MEDIUM RISK', color: '#F59E0B' };
  return { label: 'HIGH RISK', color: '#FF4444' };
}

// ─── Resend client ───────────────────────────────────────────────────────────

async function getResendClient() {
  const apiKey = getEnv('RESEND_API_KEY');
  if (!apiKey) return null;
  const { Resend } = await import('resend');
  return new Resend(apiKey);
}

// ─── core send ───────────────────────────────────────────────────────────────

/**
 * Send an email via Resend.
 * Always throws when RESEND_API_KEY is missing so callers surface the error.
 */
async function sendEmail(payload: CreateEmailOptions, label: string): Promise<void> {
  const resend = await getResendClient();

  if (!resend) {
    throw new Error(
      `[Email] RESEND_API_KEY is not set — cannot send ${label}. ` +
        'Add RESEND_API_KEY to .env.local and restart the dev server.',
    );
  }

  const response = await resend.emails.send(payload);

  if (response.error) {
    throw new Error(
      `[Email] Failed to send ${label}: ${response.error.name} – ${response.error.message}`,
    );
  }
}

// ─── HTML / text generators ──────────────────────────────────────────────────

function generateReportEmailHTML(data: ReportData): string {
  const score = clampScore(data.weirdnessScore);
  const risk = getRiskLevel(score);
  const safeProgram = escapeHtml(sanitizeSubjectSegment(data.program, 'unknown program'));
  const reportUrl = appUrl(`/report/${encodeURIComponent(data.reportId)}`);
  const commandHtml = data.command
    ? `<div class="meta"><span>Command</span><code>${escapeHtml(data.command)}</code></div>`
    : '';
  const topSyscalls = data.topSyscalls?.slice(0, 5) ?? [];
  const topSyscallsHtml = topSyscalls.length
    ? `
  <h3>TOP SYSCALLS</h3>
  ${topSyscalls
      .map((syscall, index) => {
        const name = escapeHtml(syscall.name);
        const count = formatInteger(syscall.count);
        const percentage = Math.max(0, toSafeNumber(syscall.percentage)).toFixed(1);
        return `<div class="syscall-row">
    <span>${index + 1}. ${name}</span>
    <span>${count} calls (${percentage}%)</span>
  </div>`;
      })
      .join('')}`
    : '';
  const aiReportHtml = data.aiReport
    ? `<h3>AI ANALYSIS</h3><div class="ai-report">${escapeHtml(data.aiReport)}</div>`
    : '';
  const suspiciousFlags = data.suspiciousFlags ?? [];
  const flagsHtml = suspiciousFlags.length
    ? `<h3 class="danger">&#9888; SUSPICIOUS FLAGS</h3><ul>${suspiciousFlags
      .map((flag) => `<li>${escapeHtml(flag)}</li>`)
      .join('')}</ul>`
    : '<p class="ok">&#10003; No suspicious flags detected</p>';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:monospace;background:#0A0A0F;color:#F0F0F0;padding:24px}
  .container{max-width:600px;margin:0 auto;background:#111118;border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:32px}
  h1{color:#00FF88;font-size:24px;margin:0 0 24px;word-break:break-word}
  h3{color:#888;margin-top:24px}
  ul{padding-left:20px}
  li{color:#FF6666;margin:6px 0}
  code{color:#F0F0F0;word-break:break-word}
  .metric{display:inline-block;background:#16161F;border-radius:8px;padding:12px 16px;margin:4px}
  .metric-label{color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px}
  .metric-value{color:#F0F0F0;font-size:20px;font-weight:700;margin-top:2px}
  .score{color:${risk.color}}
  .meta{background:#16161F;border-radius:8px;padding:12px 16px;margin:12px 0}
  .meta span{display:block;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
  .ai-report{background:#16161F;border-radius:8px;padding:16px;margin:16px 0;white-space:pre-wrap;font-size:13px;line-height:1.6;border-left:3px solid #00FF88}
  .syscall-row{display:flex;justify-content:space-between;gap:16px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
  .danger{color:#FF4444}
  .ok{color:#00FF88}
  .cta{display:inline-block;background:#00FF88;color:#0A0A0F;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:24px}
  .footer{margin-top:24px;color:#555;font-size:12px}
</style></head>
<body>
<div class="container">
  <h1>&#128270; Syscall Detective Report &mdash; ${safeProgram}</h1>
  ${commandHtml}
  <div>
    <div class="metric"><div class="metric-label">Total Syscalls</div><div class="metric-value">${formatInteger(data.totalCalls)}</div></div>
    <div class="metric"><div class="metric-label">Duration</div><div class="metric-value">${formatDuration(data.duration)}s</div></div>
    <div class="metric"><div class="metric-label">Weirdness Score</div><div class="metric-value score">${score}/100 <small>(${risk.label})</small></div></div>
  </div>
  ${topSyscallsHtml}
  ${aiReportHtml}
  ${flagsHtml}
  <a href="${reportUrl}" class="cta">View Full Report &rarr;</a>
  <div class="footer">&mdash; Syscall Detective</div>
</div>
</body></html>`;
}

function generateReportEmailText(data: ReportData): string {
  const score = clampScore(data.weirdnessScore);
  const risk = getRiskLevel(score);
  const lines = [
    `Syscall Detective Report - ${sanitizeSubjectSegment(data.program, 'unknown program')}`,
    '',
  ];

  if (data.command) {
    lines.push(`Command: ${data.command}`, '');
  }

  lines.push(
    `Total syscalls: ${formatInteger(data.totalCalls)}`,
    `Duration: ${formatDuration(data.duration)}s`,
    `Weirdness score: ${score}/100 (${risk.label})`,
    '',
  );

  if (data.topSyscalls?.length) {
    lines.push('Top syscalls:');
    data.topSyscalls.slice(0, 5).forEach((syscall, index) => {
      lines.push(
        `${index + 1}. ${syscall.name} - ${formatInteger(syscall.count)} calls (${Math.max(0, toSafeNumber(syscall.percentage)).toFixed(1)}%)`,
      );
    });
    lines.push('');
  }

  if (data.aiReport) {
    lines.push('AI analysis:', data.aiReport, '');
  }

  if (data.suspiciousFlags?.length) {
    lines.push('Suspicious flags:', ...data.suspiciousFlags.map((flag) => `- ${flag}`), '');
  } else {
    lines.push('No suspicious flags detected.', '');
  }

  lines.push(`View full report: ${appUrl(`/report/${encodeURIComponent(data.reportId)}`)}`);
  return lines.join('\n');
}

function generateContactMessageHTML(data: ContactMessageData): string {
  const name = data.name ? escapeHtml(data.name) : 'Website visitor';
  const email = escapeHtml(data.email);
  const message = escapeHtml(data.message);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:monospace;background:#0A0A0F;color:#F0F0F0;padding:24px}
  .container{max-width:640px;margin:0 auto;background:#111118;border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:32px}
  h1{color:#00FF88;font-size:24px;margin:0 0 24px}
  .info{background:#16161F;border-radius:8px;padding:14px 16px;margin:12px 0}
  .label{color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px}
  .value{color:#F0F0F0;font-size:15px;margin-top:4px;word-break:break-word}
  .message{white-space:pre-wrap;line-height:1.6}
  .reply-hint{margin-top:20px;padding:12px 16px;border-left:3px solid #00FF88;background:#16161F;font-size:12px;color:#888}
  .footer{margin-top:24px;color:#555;font-size:12px}
</style></head>
<body>
<div class="container">
  <h1>&#9993; Syscall Detective — Contact Message</h1>
  <div class="info"><div class="label">From</div><div class="value">${name} &lt;${email}&gt;</div></div>
  <div class="info"><div class="label">Message</div><div class="value message">${message}</div></div>
  <div class="reply-hint">Reply directly to this email to respond to <strong>${name}</strong> at <strong>${email}</strong>.</div>
  <div class="footer">&mdash; Sent via Syscall Detective contact form</div>
</div>
</body></html>`;
}

function generateContactMessageText(data: ContactMessageData): string {
  return [
    'Syscall Detective — Contact Message',
    '',
    `From: ${data.name || 'Website visitor'} <${data.email}>`,
    '',
    data.message,
    '',
    `Reply to this email to respond to ${data.name || 'the visitor'} at ${data.email}.`,
  ].join('\n');
}

// ─── public senders ──────────────────────────────────────────────────────────

/**
 * Send an analysis report.
 * • Always delivered to NOTIFICATION_EMAIL (your default inbox).
 * • Also sent to recipientEmail if it differs from the default inbox.
 */
export async function sendAnalysisReport(data: ReportData): Promise<void> {
  const defaultInbox = getNotificationEmail();

  // Build recipient list: always include the default inbox.
  const recipients: string[] = [defaultInbox];

  if (data.recipientEmail) {
    const custom = normalizeEmailAddress(data.recipientEmail, 'report recipient');
    // Add custom recipient only if it is different from the default inbox.
    if (custom.toLowerCase() !== defaultInbox.toLowerCase()) {
      recipients.push(custom);
    }
  }

  const subject = `[Syscall Detective] Report: ${sanitizeSubjectSegment(data.program, 'unknown program')}`;

  await sendEmail(
    {
      from: getFromEmail(),
      to: recipients,
      subject,
      html: generateReportEmailHTML(data),
      text: generateReportEmailText(data),
      tags: [{ name: 'category', value: 'analysis-report' }],
    },
    'analysis report',
  );
}

/**
 * Send a contact form message.
 * • Delivered to CONTACT_EMAIL (falls back to NOTIFICATION_EMAIL).
 * • Reply-To is set to the sender so you can reply directly.
 */
export async function sendContactMessage(data: ContactMessageData): Promise<void> {
  const senderEmail = normalizeEmailAddress(data.email, 'contact email');
  const destination = getContactEmail();

  await sendEmail(
    {
      from: getFromEmail(),
      to: destination,
      replyTo: senderEmail,
      subject: `[Syscall Detective] Contact: ${data.name || 'Website visitor'}`,
      html: generateContactMessageHTML({ ...data, email: senderEmail }),
      text: generateContactMessageText({ ...data, email: senderEmail }),
      tags: [{ name: 'category', value: 'contact-message' }],
    },
    'contact message',
  );
}
