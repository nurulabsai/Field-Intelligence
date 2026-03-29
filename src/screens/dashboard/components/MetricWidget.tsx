import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type MetricVariant = 'default' | 'success' | 'warning' | 'error';

interface MetricWidgetProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: number;
  variant?: MetricVariant;
}

const VARIANT_COLORS: Record<MetricVariant, { accent: string; bg: string }> = {
  default: { accent: '#FFFFFF', bg: 'rgba(255,255,255,0.05)' },
  success: { accent: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  warning: { accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  error: { accent: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
};

const MetricWidget: React.FC<MetricWidgetProps> = ({
  icon,
  value,
  label,
  trend,
  variant = 'default',
}) => {
  const colors = VARIANT_COLORS[variant];
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className="bg-bg-glass backdrop-blur-[16px] border border-border-glass rounded-xl p-6 flex flex-col gap-4 transition-all duration-200 cursor-default hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: colors.bg, color: colors.accent }}
      >
        {icon}
      </div>

      {/* Value */}
      <div>
        <div
          className="text-[2rem] font-bold leading-[1.1] tracking-[-0.02em]"
          style={{ color: colors.accent }}
        >
          {value}
        </div>
        <div className="text-[0.813rem] text-text-tertiary mt-1 font-medium">
          {label}
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div
          className={`flex items-center gap-1 text-[0.813rem] font-semibold ${trendPositive ? 'text-success' : 'text-error'}`}
        >
          {trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trendPositive ? '+' : ''}{trend}%</span>
          <span className="text-text-tertiary font-normal ml-1">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default MetricWidget;
