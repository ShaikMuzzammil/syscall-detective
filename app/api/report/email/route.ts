import { NextRequest, NextResponse } from 'next/server';
import { sendAnalysisReport, getNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, program, weirdnessScore, totalCalls, duration, aiReport, recipient } = body;

    if (!reportId || !program) {
      return NextResponse.json({ error: 'Missing required fields: reportId and program' }, { status: 400 });
    }

    // recipientEmail is optional — the default inbox always receives the report regardless.
    const recipientEmail =
      typeof recipient === 'string' && recipient.trim() ? recipient.trim() : undefined;

    await sendAnalysisReport({
      reportId,
      program,
      weirdnessScore: weirdnessScore ?? 0,
      totalCalls: totalCalls ?? 0,
      duration: duration ?? 0,
      aiReport,
      recipientEmail,
    });

    const defaultInbox = getNotificationEmail();
    const extraNote =
      recipientEmail && recipientEmail.toLowerCase() !== defaultInbox.toLowerCase()
        ? ` and ${recipientEmail}`
        : '';

    return NextResponse.json({
      success: true,
      message: `Report sent to ${defaultInbox}${extraNote}`,
    });
  } catch (error) {
    console.error('[report/email]', error);
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
