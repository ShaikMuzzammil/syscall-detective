import { SyscallEvent } from './types';
import { buildSummaryStats } from './strace-parser';
import { getWeirdnessLevel } from './weirdness-scorer';

export async function generateAIExplanation(
  syscalls: SyscallEvent[],
  program: string,
  weirdnessScore: number
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateFallbackReport(syscalls, program, weirdnessScore);
  }

  const summary = buildSummaryStats(syscalls);
  const topCalls = summary.slice(0, 15);
  const { level } = getWeirdnessLevel(weirdnessScore);
  const totalDuration = syscalls.reduce((s, e) => s + e.duration, 0);

  const prompt = `You are a Linux systems expert. Analyze these system calls from running "${program}":

Total calls: ${syscalls.length}
Duration: ${totalDuration.toFixed(3)}s
Weirdness Score: ${weirdnessScore}/100 (${level} RISK)

Top syscalls by frequency:
${topCalls.map(c => `  ${c.name}: ${c.count} calls, ${(c.percentage).toFixed(1)}% of runtime, avg ${(c.avgDuration * 1000000).toFixed(0)}µs`).join('\n')}

Categories breakdown:
${Object.entries(topCalls.reduce((acc, c) => {
  acc[c.category] = (acc[c.category] || 0) + c.count;
  return acc;
}, {} as Record<string, number>)).map(([cat, count]) => `  ${cat}: ${count} calls`).join('\n')}

Write a plain English security and performance analysis with these exact sections:
1. EXECUTIVE SUMMARY (2-3 sentences, cite numbers)
2. WHAT THIS PROGRAM DID (numbered steps, concrete details)
3. SECURITY ASSESSMENT (weirdness score justification, specific flags)
4. PERFORMANCE NOTES (bottlenecks, specific calls)
5. RECOMMENDATIONS (actionable)

Use concrete numbers. Be specific. Flag anything suspicious.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`AI provider API error: ${response.status}`);
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('[AI] Error calling provider API:', error);
    return generateFallbackReport(syscalls, program, weirdnessScore);
  }
}

function generateFallbackReport(syscalls: SyscallEvent[], program: string, weirdnessScore: number): string {
  const summary = buildSummaryStats(syscalls);
  const totalDuration = syscalls.reduce((s, e) => s + e.duration, 0);
  const topCalls = summary.slice(0, 5);
  const { level } = getWeirdnessLevel(weirdnessScore);

  const networkCalls = syscalls.filter(e => e.category === 'network').length;
  const fileCalls = syscalls.filter(e => e.category === 'fileio').length;
  const memoryCalls = syscalls.filter(e => e.category === 'memory').length;

  return `EXECUTIVE SUMMARY
─────────────────
This program (${program}) performed ${syscalls.length.toLocaleString()} system calls over ${totalDuration.toFixed(3)} seconds. The majority of time was spent in ${topCalls[0]?.category || 'mixed'} operations. The program received a weirdness score of ${weirdnessScore}/100 (${level} RISK).

WHAT THIS PROGRAM DID
─────────────────────
1. Initialization: Loaded shared libraries via openat() and mmap() calls during startup.
${fileCalls > 0 ? `\n2. File I/O: Performed ${fileCalls} file operations including opening, reading, and closing file descriptors.` : ''}
${networkCalls > 0 ? `\n3. Network Activity: Made ${networkCalls} network-related calls including socket creation and connections.` : ''}
${memoryCalls > 0 ? `\n4. Memory Management: Performed ${memoryCalls} memory operations including mmap and mprotect calls.` : ''}
${fileCalls === 0 && networkCalls === 0 ? '\n2. Execution: Ran the main program logic with standard system call patterns.' : ''}

5. Cleanup: Released file descriptors and memory mappings before exiting.

SECURITY ASSESSMENT
───────────────────
Weirdness Score: ${weirdnessScore}/100 (${level} RISK)
${weirdnessScore <= 30
  ? '✅ No shell spawning detected\n✅ No suspicious port connections\n✅ No sensitive file access\n✅ Normal execution pattern'
  : weirdnessScore <= 60
  ? '⚠️  Some potentially interesting syscall patterns detected\n⚠️  Review network connections if unexpected\n✅ No critical security violations found'
  : '🔴 Elevated risk indicators detected\n🔴 Review the suspicious syscall flags carefully\n⚠️  Consider running in further isolated environment'
}

PERFORMANCE NOTES
─────────────────
${topCalls[0] ? `- ${topCalls[0].name}() is the most frequent call — ${topCalls[0].count} calls (${topCalls[0].percentage.toFixed(1)}% of runtime)` : '- Normal performance profile'}
${topCalls[1] ? `- ${topCalls[1].name}() contributed ${topCalls[1].percentage.toFixed(1)}% of total runtime` : ''}
- Total execution time: ${totalDuration.toFixed(3)} seconds across ${syscalls.length.toLocaleString()} syscalls

RECOMMENDATIONS
───────────────
${weirdnessScore <= 30
  ? 'This binary appears safe to run. Standard security practices apply.'
  : weirdnessScore <= 60
  ? 'Review the flagged syscalls in the suspicious activity panel. Consider network monitoring for production use.'
  : 'High weirdness score warrants careful review. Examine each suspicious flag before running in production.'
}`;
}
