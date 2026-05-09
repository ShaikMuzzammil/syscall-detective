import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className, glow, hover, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-xl',
        hover && 'card-hover cursor-pointer',
        glow && 'border-glow',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
