import { NextRequest, NextResponse } from 'next/server';
import { sendContactMessage, getContactEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!email || !email.includes('@') || !message) {
      return NextResponse.json(
        { error: 'Email and message are required.' },
        { status: 400 },
      );
    }

    await sendContactMessage({ name: name || undefined, email, message });

    const destination = getContactEmail();
    return NextResponse.json({
      success: true,
      message: `Message sent to ${destination}`,
    });
  } catch (error) {
    console.error('[contact]', error);
    const message = error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
