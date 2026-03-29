import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'avatar' | 'chart';
  count?: number;
}

const shimmerKeyframes = `
@keyframes nuru-shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}
`;

const shimmerStyle: React.CSSProperties = {
  background:
    'linear-gradient(90deg, #252525 0%, #2E2E2E 40%, #353535 50%, #2E2E2E 60%, #252525 100%)',
  backgroundSize: '800px 100%',
  animation: 'nuru-shimmer 1.8s ease-in-out infinite',
  borderRadius: '8px',
};

const SkeletonCard: React.FC = () => (
  <div
    style={{
      backgroundColor: 'var(--color-bg-card, #1E1E1E)',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <div style={{ ...shimmerStyle, height: '20px', width: '60%', marginBottom: '12px' }} />
    <div style={{ ...shimmerStyle, height: '14px', width: '100%', marginBottom: '8px' }} />
    <div style={{ ...shimmerStyle, height: '14px', width: '80%', marginBottom: '12px' }} />
    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={{ ...shimmerStyle, height: '32px', width: '80px', borderRadius: '9999px' }} />
      <div style={{ ...shimmerStyle, height: '32px', width: '60px', borderRadius: '9999px' }} />
    </div>
  </div>
);

const SkeletonText: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{ ...shimmerStyle, height: '14px', width: '100%' }} />
    <div style={{ ...shimmerStyle, height: '14px', width: '90%' }} />
    <div style={{ ...shimmerStyle, height: '14px', width: '75%' }} />
  </div>
);

const SkeletonAvatar: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ ...shimmerStyle, width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ ...shimmerStyle, height: '14px', width: '120px', marginBottom: '6px' }} />
      <div style={{ ...shimmerStyle, height: '12px', width: '80px' }} />
    </div>
  </div>
);

const SkeletonChart: React.FC = () => (
  <div
    style={{
      backgroundColor: 'var(--color-bg-card, #1E1E1E)',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <div style={{ ...shimmerStyle, height: '16px', width: '40%', marginBottom: '16px' }} />
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
      {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
        <div
          key={i}
          style={{
            ...shimmerStyle,
            flex: 1,
            height: `${h}%`,
            borderRadius: '4px 4px 0 0',
          }}
        />
      ))}
    </div>
  </div>
);

const variantMap: Record<string, React.FC> = {
  card: SkeletonCard,
  text: SkeletonText,
  avatar: SkeletonAvatar,
  chart: SkeletonChart,
};

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
}) => {
  const Component = variantMap[variant];

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: count }, (_, i) => (
          <Component key={i} />
        ))}
      </div>
    </>
  );
};

export default LoadingSkeleton;
