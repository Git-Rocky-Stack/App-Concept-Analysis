import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdMobInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
}

// Declare global types for Native Bridges
declare global {
  interface Window {
    Android?: {
      showInterstitial: () => void;
    };
    webkit?: {
      messageHandlers?: {
        nativeAd?: {
          postMessage: (msg: string) => void;
        };
      };
    };
  }
}

export const AdMobInterstitial: React.FC<AdMobInterstitialProps> = ({ isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check if running in Native Wrapper
    const isAndroid = typeof window !== 'undefined' && !!window.Android;
    const isIOS = typeof window !== 'undefined' && !!window.webkit?.messageHandlers?.nativeAd;
    
    if (isAndroid || isIOS) {
      setIsNative(true);
    }

    if (isOpen) {
      if (isAndroid) {
        // Call Android Interface
        window.Android?.showInterstitial();
        // Immediately close the React modal state because the Native Ad takes over screen
        onClose(); 
        return;
      } else if (isIOS) {
        // Call iOS Interface
        window.webkit?.messageHandlers?.nativeAd?.postMessage('showInterstitial');
        // Immediately close the React modal state
        onClose();
        return;
      }

      // Web Simulation Logic
      setTimeLeft(5);
      setCanClose(false);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanClose(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, onClose]);

  // If native, we render nothing (Native SDK handles UI) or if closed
  if (!isOpen || isNative) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="absolute top-4 right-4">
        {canClose ? (
          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-md transition-all border border-white/20"
          >
            <X size={24} />
          </button>
        ) : (
          <div className="bg-black/50 text-white text-xs font-mono py-1 px-3 rounded-full border border-white/10 flex items-center gap-2">
            <span>Reward granted in {timeLeft}s</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-xl p-8 text-center shadow-2xl border border-neutral-800 relative overflow-hidden">
        {/* Ad Badge */}
        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
            AD
        </div>

        <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-900/50">
           <span className="text-white font-bold text-2xl">A</span>
        </div>
        
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Acme App Analytics</h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8">
            Boost your retention by 200% with our AI-driven insights engine.
        </p>

        <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors uppercase text-sm tracking-wider">
            Install Now
        </button>
      </div>

      <div className="absolute bottom-8 text-neutral-500 text-[10px] uppercase tracking-widest">
        Google AdMob Interstitial (Simulation)
      </div>
    </div>
  );
};