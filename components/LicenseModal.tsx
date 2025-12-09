import React, { useState } from 'react';
import { X, Key, ExternalLink, Check, AlertCircle, Crown, Zap, BarChart3, Image, Scale, Download, Bookmark, Loader2 } from 'lucide-react';
import { useLicense } from '../contexts/LicenseContext';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose }) => {
  const { isPro, licenseData, activate, deactivate, openCheckout } = useLicense();
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await activate(licenseKey, email || undefined);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setLicenseKey('');
      setEmail('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } else {
      setError(result.error || 'Failed to activate license');
    }
  };

  const handleDeactivate = () => {
    deactivate();
    setSuccess(false);
    setError(null);
  };

  const proFeatures = [
    { icon: Zap, label: 'Unlimited idea generations' },
    { icon: BarChart3, label: 'Full SWOT & market analysis' },
    { icon: Image, label: 'AI concept art generation' },
    { icon: Scale, label: 'Side-by-side comparison tool' },
    { icon: Download, label: 'Export to PDF, CSV, JSON' },
    { icon: Bookmark, label: 'Unlimited saved ideas' },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Crown size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide">
                {isPro ? 'Pro License Active' : 'Upgrade to Pro'}
              </h2>
              <p className="text-red-200 text-sm">
                {isPro ? 'All features unlocked' : 'Unlock the full potential'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {isPro ? (
            // Pro user view
            <div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                  <Check size={18} />
                  <span className="font-bold text-sm uppercase tracking-wide">License Activated</span>
                </div>
                <p className="text-green-600 dark:text-green-500 text-xs font-mono break-all">
                  {licenseData?.key}
                </p>
                {licenseData?.activatedAt && (
                  <p className="text-green-600/70 dark:text-green-500/70 text-xs mt-2">
                    Activated: {new Date(licenseData.activatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <button
                onClick={handleDeactivate}
                className="w-full py-3 text-sm font-bold uppercase tracking-wide text-neutral-500 hover:text-red-600 dark:hover:text-red-500 transition-colors"
              >
                Deactivate License
              </button>
            </div>
          ) : (
            // Free user view
            <div>
              {/* Features list */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                  Pro Features Include
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {proFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 text-xs p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
                    >
                      <feature.icon size={14} className="text-red-600 dark:text-red-500 shrink-0" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy button */}
              <button
                onClick={openCheckout}
                className="w-full py-4 mb-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                Get Pro License
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-neutral-900 px-3 text-neutral-500">
                    Already have a key?
                  </span>
                </div>
              </div>

              {/* License key input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                    License Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                      placeholder="Enter your license key"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                {/* Success message */}
                {success && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-xs bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <Check size={14} />
                    License activated successfully!
                  </div>
                )}

                {/* Activate button */}
                <button
                  onClick={handleActivate}
                  disabled={!licenseKey.trim() || loading}
                  className={`w-full py-3 font-bold uppercase tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                    ${!licenseKey.trim() || loading
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                      : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100'
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Key size={16} />
                      Activate License
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
