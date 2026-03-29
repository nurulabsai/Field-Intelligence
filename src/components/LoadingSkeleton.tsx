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

const shimmerClass = "bg-[linear-gradient(90deg,#252525_0%,#2E2E2E_40%,#353535_50%,#2E2E2E_60%,#252525_100%)] bg-[length:800px_100%] animate-[nuru-shimmer_1.8s_ease-in-out_infinite] rounded-lg";

const SkeletonCard: React.FC = () => (
  <div className="bg-bg-card rounded-lg p-4 border border-[rgba(255,255,255,0.06)]">
    <div className={`${shimmerClass} h-5 w-3/5 mb-3`} />
    <div className={`${shimmerClass} h-3.5 w-full mb-2`} />
    <div className={`${shimmerClass} h-3.5 w-4/5 mb-3`} />
    <div className="flex gap-2">
      <div className={`${shimmerClass} h-8 w-20 !rounded-full`} />
      <div className={`${shimmerClass} h-8 w-[60px] !rounded-full`} />
    </div>
  </div>
);

const SkeletonText: React.FC = () => (
  <div className="flex flex-col gap-2">
    <div className={`${shimmerClass} h-3.5 w-full`} />
    <div className={`${shimmerClass} h-3.5 w-[90%]`} />
    <div className={`${shimmerClass} h-3.5 w-3/4`} />
  </div>
);

const SkeletonAvatar: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className={`${shimmerClass} w-10 h-10 !rounded-full shrink-0`} />
    <div className="flex-1">
      <div className={`${shimmerClass} h-3.5 w-[120px] mb-1.5`} />
      <div className={`${shimmerClass} h-3 w-20`} />
    </div>
  </div>
);

const SkeletonChart: React.FC = () => (
  <div className="bg-bg-card rounded-lg p-4 border border-[rgba(255,255,255,0.06)]">
    <div className={`${shimmerClass} h-4 w-2/5 mb-4`} />
    <div className="flex items-end gap-2 h-[120px]">
      {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
        <div
          key={i}
          className={`${shimmerClass} flex-1 !rounded-b-none !rounded-t`}
          style={{ height: `${h}%` }}
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
  const Component = variantMap[variant] ?? SkeletonCard;

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }, (_, i) => (
          <Component key={i} />
        ))}
      </div>
    </>
  );
};

export default LoadingSkeleton;
