import React from 'react';

interface ScreenLayoutProps {
  children: React.ReactNode;
  className?: string;
  withBottomNavOffset?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ 
  children, 
  className = '',
  withBottomNavOffset = true
}) => {
  return (
    <div className={`font-sans text-white min-h-screen flex flex-col bg-[#0B0F19] ${className}`}>
      <div className={`flex-1 w-full max-w-[430px] mx-auto min-h-screen relative ${withBottomNavOffset ? 'pb-40' : ''}`}>
        {children}
        
        {/* iPhone Safe Area Bottom Indicator */}
        <div className="fixed bottom-0 left-0 right-0 h-6 flex justify-center items-end pb-2 pointer-events-none max-w-[430px] mx-auto z-[101]">
          <div className="w-32 h-1.5 bg-white/10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
