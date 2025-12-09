import React from 'react';
import { X, Crown, Lock, ExternalLink, Key } from 'lucide-react';
import { useLicense } from '../contexts/LicenseContext';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

const featureDescriptions: Record<string, { title: string; description: string }> = {
  deep_analysis: {
    title: 'Deep Dive Analysis',
    description: 'Get full SWOT analysis, market verdict, and 12-month growth projections for your app ideas.',
  },
  image_generation: {
    title: 'AI Concept Art',
    description: 'Generate professional app store concept images using AI to visualize your ideas.',
  },
  comparison: {
    title: 'Comparison Tool',
    description: 'Compare multiple app ideas side-by-side to make data-driven decisions.',
  },
  export: {
    title: 'Export Features',
    description: 'Export your ideas and analysis to PDF, CSV, or JSON for presentations and records.',
  },
  unlimited_generations: {
    title: 'Unlimited Generations',
    description: 'Generate as many app ideas as you want without daily limits.',
  },
  unlimited_saves: {
    title: 'Unlimited Saves',
    description: 'Save unlimited ideas to your personal collection for future reference.',
  },
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ isOpen, onClose, feature }) => {
  const { setShowLicenseModal, openCheckout } = useLicense();

  if (!isOpen) return null;

  const featureInfo = featureDescriptions[feature] || {
    title: 'Pro Feature',
    description: 'This feature is available exclusively to Pro users.',
  };

  const handleGetPro = () => {
    onClose();
    openCheckout();
  };

  const handleEnterKey = () => {
    onClose();
    setShowLicenseModal(true);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl max-w-sm w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Lock Icon Header */}
        <div className="relative pt-8 pb-4 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
            <Lock size={28} className="text-white" />
          </div>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
            {featureInfo.title}
          </h2>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Crown size={14} className="text-yellow-500" />
            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">
              Pro Feature
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-neutral-600 dark:text-neutral-400 text-sm text-center mb-6">
            {featureInfo.description}
          </p>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGetPro}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Upgrade to Pro
            </button>

            <button
              onClick={handleEnterKey}
              className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold uppercase tracking-wide text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Key size={14} />
              I Have a License Key
            </button>
          </div>

          <p className="text-neutral-400 text-xs text-center mt-4">
            One-time purchase. No subscription.
          </p>
        </div>
      </div>
    </div>
  );
};
