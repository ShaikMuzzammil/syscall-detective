import { NextRequest, NextResponse } from 'next/server';
import { generateAIExplanation } from '@/lib/ai-explain';

export async function POST(req: NextRequest) {
  try {
    const { syscalls, program, weirdnessScore } = await req.json();

    if (!syscalls || !program) {
      return NextResponse.json({ error: 'Missing syscalls or program' }, { status: 400 });
    }

    const report = await generateAIExplanation(syscalls, program, weirdnessScore || 0);

    return NextResponse.json({ report });
  } catch (error) {
    console.error('[ai-explain]', error);
    return NextResponse.json({ error: 'Failed to generate AI explanation' }, { status: 500 });
  }
}
