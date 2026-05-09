import { NextResponse } from 'next/server';
import {
  isResendConfigured,
  getFromEmail,
  getNotificationEmail,
  getContactEmail,
} from '@/lib/email';

export async function GET() {
  try {
    return NextResponse.json({
      resendConfigured: isResendConfigured(),
      fromEmail: getFromEmail(),
      notificationEmail: 'Host',
      contactEmail: 'Host',
    });
  } catch (error) {
    return NextResponse.json(
      {
        resendConfigured: false,
        fromEmail: null,
        notificationEmail: 'Host',
        contactEmail: 'Host',
        error: error instanceof Error ? error.message : 'Configuration error',
      },
      { status: 200 },
    );
  }
}
