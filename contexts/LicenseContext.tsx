import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  isPro as checkIsPro,
  activateLicense,
  deactivateLicense,
  getLicenseData,
  canGenerate,
  canSave,
  recordGeneration,
  updateSavedCount,
  getRemainingGenerations,
  hasFeature,
  ProFeature,
  LicenseData,
  LEMONSQUEEZY_CHECKOUT_URL,
} from '../services/licenseService';

interface LicenseContextType {
  // License state
  isPro: boolean;
  licenseData: LicenseData | null;

  // License actions
  activate: (key: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  deactivate: () => void;
  openCheckout: () => void;

  // Usage limits
  canGenerate: () => boolean;
  canSave: (currentCount: number) => boolean;
  remainingGenerations: number;
  recordGeneration: () => void;
  updateSavedCount: (count: number) => void;

  // Feature checks
  hasFeature: (feature: ProFeature) => boolean;

  // Modal control
  showLicenseModal: boolean;
  setShowLicenseModal: (show: boolean) => void;
  showUpgradePrompt: boolean;
  setShowUpgradePrompt: (show: boolean) => void;
  upgradePromptFeature: string;
  setUpgradePromptFeature: (feature: string) => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const useLicense = (): LicenseContextType => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};

interface LicenseProviderProps {
  children: ReactNode;
}

export const LicenseProvider: React.FC<LicenseProviderProps> = ({ children }) => {
  const [isPro, setIsPro] = useState<boolean>(checkIsPro());
  const [licenseData, setLicenseData] = useState<LicenseData | null>(getLicenseData());
  const [remainingGenerations, setRemainingGenerations] = useState<number>(getRemainingGenerations());
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState<boolean>(false);
  const [upgradePromptFeature, setUpgradePromptFeature] = useState<string>('');

  // Refresh state from storage
  const refreshState = useCallback(() => {
    setIsPro(checkIsPro());
    setLicenseData(getLicenseData());
    setRemainingGenerations(getRemainingGenerations());
  }, []);

  // Listen for storage changes (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshState]);

  const activate = useCallback(async (key: string, email?: string) => {
    const result = await activateLicense(key, email);
    if (result.success) {
      refreshState();
    }
    return result;
  }, [refreshState]);

  const deactivate = useCallback(() => {
    deactivateLicense();
    refreshState();
  }, [refreshState]);

  const openCheckout = useCallback(() => {
    window.open(LEMONSQUEEZY_CHECKOUT_URL, '_blank');
  }, []);

  const checkCanGenerate = useCallback(() => {
    return canGenerate();
  }, []);

  const checkCanSave = useCallback((currentCount: number) => {
    return canSave(currentCount);
  }, []);

  const doRecordGeneration = useCallback(() => {
    recordGeneration();
    setRemainingGenerations(getRemainingGenerations());
  }, []);

  const doUpdateSavedCount = useCallback((count: number) => {
    updateSavedCount(count);
  }, []);

  const checkHasFeature = useCallback((feature: ProFeature) => {
    return hasFeature(feature);
  }, []);

  const value: LicenseContextType = {
    isPro,
    licenseData,
    activate,
    deactivate,
    openCheckout,
    canGenerate: checkCanGenerate,
    canSave: checkCanSave,
    remainingGenerations,
    recordGeneration: doRecordGeneration,
    updateSavedCount: doUpdateSavedCount,
    hasFeature: checkHasFeature,
    showLicenseModal,
    setShowLicenseModal,
    showUpgradePrompt,
    setShowUpgradePrompt,
    upgradePromptFeature,
    setUpgradePromptFeature,
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};
