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
      style={{
        backgroundColor: 'var(--glass-bg, rgba(30,30,30,0.8))',
        backdropFilter: 'var(--glass-blur, blur(16px))',
        WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.accent,
        }}
      >
        {icon}
      </div>

      {/* Value */}
      <div>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: colors.accent,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: '0.813rem',
            color: '#6B7280',
            marginTop: '4px',
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.813rem',
            fontWeight: 600,
            color: trendPositive ? '#22C55E' : '#EF4444',
          }}
        >
          {trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trendPositive ? '+' : ''}{trend}%</span>
          <span style={{ color: '#6B7280', fontWeight: 400, marginLeft: '4px' }}>vs last week</span>
        </div>
      )}
    </div>
  );
};

export default MetricWidget;
