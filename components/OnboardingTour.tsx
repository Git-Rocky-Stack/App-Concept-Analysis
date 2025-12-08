import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom';
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, isOpen, onClose, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updatePosition = useCallback(() => {
    if (!isOpen) return;
    const step = steps[currentStepIndex];
    if (!step) return;
    
    const element = document.getElementById(step.targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTargetRect(element.getBoundingClientRect());
    }
  }, [isOpen, currentStepIndex, steps]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Add a small delay to handle layout shifts or scroll animations
      const timer = setTimeout(updatePosition, 500);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isOpen, currentStepIndex, updatePosition]);

  if (!isOpen || !targetRect) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };
  
  // Calculate tooltip position
  const tooltipWidth = 320;
  const margin = 16;
  const windowWidth = window.innerWidth;
  
  // Determine if tooltip should be above or below based on space
  const isTop = currentStep.position === 'top' || (!currentStep.position && targetRect.top > 400);
  
  // Calculate Horizontal Position to keep within viewport
  let leftPos = targetRect.left + (targetRect.width / 2);
  let transform = 'translateX(-50%)';
  let leftStyle: React.CSSProperties = { left: leftPos, transform };

  // Adjust if too close to edges
  if (leftPos < (tooltipWidth / 2) + margin) {
      leftStyle = { left: margin, transform: 'none' };
  } else if (leftPos > windowWidth - (tooltipWidth / 2) - margin) {
      leftStyle = { right: margin, left: 'auto', transform: 'none' };
  }

  const tooltipStyle: React.CSSProperties = {
      ...leftStyle,
      ...(isTop 
          ? { bottom: window.innerHeight - targetRect.top + margin } 
          : { top: targetRect.bottom + margin }
      )
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
       {/* Cutout Overlay Effect */}
       <div 
         className="absolute transition-all duration-300 ease-in-out border-neutral-900/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] rounded-lg pointer-events-auto backdrop-blur-[2px]"
         style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
         }}
       >
         {/* Highlight Ring */}
         <div className="absolute inset-0 rounded-lg ring-2 ring-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse"></div>
       </div>

       {/* Tooltip Card */}
       <div 
         className="absolute pointer-events-auto transition-all duration-300 w-full max-w-[320px] px-4"
         style={tooltipStyle}
       >
          <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-2xl relative">
              <div className="flex justify-between items-start mb-3">
                  <h3 className="text-neutral-900 dark:text-white font-bold text-lg uppercase tracking-wide">{currentStep.title}</h3>
                  <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white transition-colors" aria-label="Close Tour">
                      <X size={18} />
                  </button>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
                  {currentStep.description}
              </p>
              
              <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                      {steps.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${idx === currentStepIndex ? 'bg-red-600 w-4' : 'bg-neutral-300 dark:bg-neutral-800'}`}
                          />
                      ))}
                  </div>
                  <div className="flex gap-3">
                      <button 
                        onClick={handlePrev} 
                        disabled={currentStepIndex === 0}
                        className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-20 disabled:hover:text-neutral-500 transition-colors"
                      >
                          <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors shadow-lg"
                      >
                          {isLastStep ? 'Finish' : 'Next'}
                          {isLastStep ? <Check size={14} /> : <ChevronRight size={14} />}
                      </button>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};