'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Download, Loader2, CheckCircle } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import toast from 'react-hot-toast';

interface Props { result: AnalysisResult }

const DEFAULT_RECIPIENT_EMAIL = '';
const PREFS_KEY = 'syscall-detective-settings';

export default function AIReport({ result }: Props) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(DEFAULT_RECIPIENT_EMAIL);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedPrefs = localStorage.getItem(PREFS_KEY);
        if (!savedPrefs) return;

        const parsed = JSON.parse(savedPrefs) as { reportRecipient?: string; autoEmailReports?: boolean };
        if (parsed.autoEmailReports !== false && parsed.reportRecipient) {
          setRecipientEmail(parsed.reportRecipient);
        }
      } catch {
        setRecipientEmail(DEFAULT_RECIPIENT_EMAIL);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const sendEmail = async () => {
    setEmailSending(true);
    try {
      const res = await fetch('/api/report/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: result.id,
          recipient: recipientEmail,
          program: result.program,
          weirdnessScore: result.weirdnessScore,
          totalCalls: result.totalCalls,
          duration: result.duration,
          aiReport: result.aiReport,
          includeRaw: false,
        }),
      });
      if (res.ok) {
        setEmailSent(true);
        toast.success(`Report sent to ${recipientEmail}`);
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast.error('Failed to send email. Check your Resend API key.');
    } finally {
      setEmailSending(false);
    }
  };

  const report = result.aiReport || 'No AI report available. Set ANTHROPIC_API_KEY to enable AI analysis.';

  const sections = report.split('\n').filter(l => l.trim());

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary font-mono">AI Analysis Report</h3>
          <p className="text-xs text-text-muted mt-0.5">Generated analysis - {result.program}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={sendEmail}
            disabled={emailSending || emailSent}
            className="flex items-center gap-1.5 px-3 py-2 bg-bg-card border border-white/10 rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-60"
          >
            {emailSending ? <Loader2 className="w-3 h-3 animate-spin" /> :
             emailSent ? <CheckCircle className="w-3 h-3 text-accent-green" /> :
             <Mail className="w-3 h-3" />}
            {emailSent ? 'Sent!' : 'Email Report'}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-bg-card border border-white/10 rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors">
            <Download className="w-3 h-3" />PDF
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="bg-bg-card border border-white/10 rounded-xl p-5 font-mono text-sm leading-relaxed space-y-0.5 max-h-[600px] overflow-y-auto">
        {sections.map((line, i) => {
          const isHeading = line.match(/^[A-Z][A-Z\s]+$/) || line.match(/^─{3,}/);
          const isSuccess = line.includes('✅');
          const isWarning = line.includes('⚠') || line.includes('⚠️');
          const isDanger = line.includes('🔴');
          const isNumber = line.match(/^\d+\./);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.01 }}
              className={
                isHeading ? 'text-accent-green font-bold mt-4 mb-1 text-xs tracking-widest' :
                isSuccess ? 'text-accent-green text-xs' :
                isWarning ? 'text-accent-yellow text-xs' :
                isDanger ? 'text-danger-red text-xs' :
                isNumber ? 'text-text-secondary ml-2 text-xs' :
                line.match(/^─/) ? 'border-b border-white/10 mt-1 mb-2' :
                'text-text-secondary text-xs'
              }
            >
              {line}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
