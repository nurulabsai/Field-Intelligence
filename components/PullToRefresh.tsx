
import React, { useState, useRef } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  isHighContrast?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, isHighContrast }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  
  // Refs for gesture tracking to ensure synchronous access
  const startY = useRef(0);
  const currentPull = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const threshold = 70;
  const maxPull = 150;

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start if we are near the top of the scroll container
    // Using 5px buffer for reliability
    if (containerRef.current && containerRef.current.scrollTop <= 5 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
      currentPull.current = 0;
    } else {
      isDragging.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const dy = currentY - startY.current;

    // Only handle pull down when at top
    if (dy > 0 && containerRef.current && containerRef.current.scrollTop <= 5) {
      // Apply resistance factor (0.5)
      const damped = Math.min(dy * 0.5, maxPull);
      currentPull.current = damped;
      setTranslateY(damped);
    } else {
      // If user scrolls back up past start point, or scrolls down
      currentPull.current = 0;
      setTranslateY(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging.current || isRefreshing) return;
    isDragging.current = false;

    if (currentPull.current > threshold) {
      setIsRefreshing(true);
      setTranslateY(threshold); // Snap to loading position
      
      try {
        await onRefresh();
      } catch (e) {
        console.error("Refresh failed", e);
      } finally {
        // Delay to show success state/transition
        setTimeout(() => {
          setIsRefreshing(false);
          setTranslateY(0);
          currentPull.current = 0;
        }, 500);
      }
    } else {
      // Snap back if threshold not met
      setTranslateY(0);
      currentPull.current = 0;
    }
  };

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
       {/* Loader Container */}
       <div 
         className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-20"
         style={{ 
           height: `${threshold}px`,
           transform: `translateY(${translateY - threshold}px)`,
           transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
         }}
       >
         <div className="flex items-center justify-end flex-col pb-4 h-full">
           <div className={`p-2 rounded-full shadow-lg border flex items-center justify-center ${isHighContrast ? 'bg-black border-yellow-300' : 'bg-white border-slate-100'}`}>
              {isRefreshing ? (
                 <Loader2 className={`w-5 h-5 animate-spin ${isHighContrast ? 'text-yellow-300' : 'text-teal-600'}`} />
              ) : (
                 <ArrowDown 
                   className={`w-5 h-5 transition-transform duration-200 ${isHighContrast ? 'text-yellow-300' : 'text-teal-600'}`}
                   style={{ transform: `rotate(${translateY > threshold ? 180 : 0}deg)` }} 
                 />
              )}
           </div>
         </div>
       </div>

       {/* Scrollable Content */}
       <div 
         ref={containerRef}
         className="flex-1 overflow-y-auto no-scrollbar relative z-10"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
         style={{ 
           transform: `translateY(${translateY}px)`, 
           transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
           touchAction: 'pan-y'
         }}
       >
         {children}
       </div>
    </div>
  );
};
