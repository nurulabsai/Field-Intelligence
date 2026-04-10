import React from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import { cn } from '../../../design-system';

type MetricVariant = 'default' | 'success' | 'warning' | 'error';

interface MetricWidgetProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: number;
  variant?: MetricVariant;
}

const VARIANT_CLASSES: Record<MetricVariant, { icon: string; value: string }> = {
  default: { icon: 'bg-white/[0.05] text-white', value: 'text-white' },
  success: { icon: 'bg-success/[0.08] text-success', value: 'text-success' },
  warning: { icon: 'bg-warning/[0.08] text-warning', value: 'text-warning' },
  error: { icon: 'bg-error/[0.08] text-error', value: 'text-error' },
};

const MetricWidget: React.FC<MetricWidgetProps> = ({
  icon,
  value,
  label,
  trend,
  variant = 'default',
}) => {
  const classes = VARIANT_CLASSES[variant];
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className="nuru-glass-card border border-border-glass rounded-[32px] p-6 flex flex-col gap-4 transition-all duration-[var(--transition-slow)] cursor-default hover:-translate-y-0.5"
    >
      {/* Icon */}
      <div
        className={cn('w-11 h-11 rounded-xl flex items-center justify-center', classes.icon)}
      >
        {icon}
      </div>

      {/* Value */}
      <div>
        <div className={cn('text-[2rem] font-bold leading-[1.1] tracking-[-0.02em]', classes.value)}>
          {value}
        </div>
        <div className="text-sm text-text-tertiary mt-1 font-medium">
          {label}
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div
          className={cn(
            'flex items-center gap-1 text-sm font-semibold',
            trendPositive ? 'text-success' : 'text-error',
          )}
        >
          {trendPositive ? (
            <MaterialIcon name="trending_up" size={14} />
          ) : (
            <MaterialIcon name="trending_down" size={14} />
          )}
          <span>{trendPositive ? '+' : ''}{trend}%</span>
          <span className="text-text-tertiary font-normal ml-1">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default MetricWidget;
