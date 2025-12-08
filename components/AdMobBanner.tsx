import React, { useEffect, useState } from 'react';

export const AdMobBanner: React.FC = () => {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check for native bridges
    if (
      (typeof window !== 'undefined' && !!window.Android) ||
      (typeof window !== 'undefined' && !!window.webkit?.messageHandlers?.nativeAd)
    ) {
      setIsNative(true);
    }
  }, []);

  // If native, return empty div (or a spacer if the native banner overlays content)
  // Usually native banners are placed *below* the webview or *above* it.
  // We'll return a spacer to ensure content isn't cut off by a bottom native banner.
  if (isNative) {
    return <div className="h-[50px] sm:h-[60px] w-full bg-transparent"></div>;
  }

  return (
    <div className="w-full bg-gray-100 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 flex flex-col items-center justify-center py-2 transition-colors duration-300">
      {/* Web Simulation Placeholder */}
      <div className="w-[320px] h-[50px] sm:w-[468px] sm:h-[60px] bg-neutral-200 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-md flex items-center justify-center relative overflow-hidden group cursor-default">
         <div className="absolute inset-0 bg-neutral-300/20 dark:bg-neutral-700/20 skew-x-12 -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
         <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-500 font-bold">
            Google AdMob Banner
         </span>
      </div>
      <p className="text-[9px] text-neutral-400 mt-1">Space reserved for native ad layer</p>
    </div>
  );
};