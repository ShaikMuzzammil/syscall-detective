import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function formatDuration(seconds: number): string {
  if (seconds < 0.001) return `${(seconds * 1000000).toFixed(0)}µs`;
  if (seconds < 1) return `${(seconds * 1000).toFixed(1)}ms`;
  return `${seconds.toFixed(2)}s`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    fileio: '#3B82F6',
    network: '#F59E0B',
    process: '#EF4444',
    memory: '#8B5CF6',
    signal: '#EC4899',
    ipc: '#14B8A6',
    security: '#FF8C00',
    misc: '#6B7280',
  };
  return colors[category] || '#6B7280';
}
