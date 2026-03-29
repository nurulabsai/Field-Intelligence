import { cn } from '../../design-system';

type BadgeStatus =
  | 'completed'
  | 'syncing'
  | 'failed'
  | 'error'
  | 'in_progress'
  | 'action_required'
  | 'pending';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  BadgeStatus,
  { label: string; text: string; bg: string; border: string; dot?: string }
> = {
  completed: {
    label: 'Completed',
    text: 'text-neon-lime',
    bg: 'bg-neon-lime/10',
    border: 'border-neon-lime/30',
  },
  syncing: {
    label: 'Syncing',
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    dot: 'bg-neon-cyan animate-pulse-cyan',
  },
  failed: {
    label: 'Failed',
    text: 'text-neon-red',
    bg: 'bg-neon-red/10',
    border: 'border-neon-red/30',
  },
  error: {
    label: 'Error',
    text: 'text-neon-red',
    bg: 'bg-neon-red/10',
    border: 'border-neon-red/30',
  },
  in_progress: {
    label: 'In Progress',
    text: 'text-neon-lime',
    bg: 'bg-neon-lime/10',
    border: 'border-neon-lime/30',
    dot: 'bg-neon-lime animate-pulse-lime',
  },
  action_required: {
    label: 'Action Required',
    text: 'text-neon-amber',
    bg: 'bg-neon-amber/10',
    border: 'border-neon-amber/30',
  },
  pending: {
    label: 'Pending',
    text: 'text-slate-400',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
};

export default function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const displayLabel = label ?? config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-manrope font-bold uppercase tracking-[0.15em]',
        config.text,
        config.bg,
        config.border,
        size === 'sm' ? 'px-2.5 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]'
      )}
    >
      {config.dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      )}
      {displayLabel}
    </span>
  );
}
