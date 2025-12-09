/**
 * License Service for LemonSqueezy Integration
 *
 * License Key Format: STGX-XXXX-XXXX-XXXX (16 chars after prefix)
 * Keys are validated locally for format, and can be validated against
 * LemonSqueezy API for activation status.
 *
 * For MVP: We use format validation + localStorage
 * For Production: Add LemonSqueezy API validation
 */

const LICENSE_STORAGE_KEY = 'strategia_license';
const USAGE_STORAGE_KEY = 'strategia_usage';

export interface LicenseData {
  key: string;
  activatedAt: string;
  email?: string;
}

export interface UsageData {
  generationsToday: number;
  lastGenerationDate: string;
  savedIdeasCount: number;
}

/**
 * LemonSqueezy Configuration
 *
 * To set up:
 * 1. Create account at https://lemonsqueezy.com
 * 2. Create a product with "License key" type
 * 3. Copy your checkout URL from Product → Share → Checkout URL
 * 4. Replace the URL below with your actual checkout URL
 *
 * Example URL format: https://your-store.lemonsqueezy.com/buy/abc123xyz
 */
export const LEMONSQUEEZY_CHECKOUT_URL = 'https://strategia-x.lemonsqueezy.com/buy/YOUR-PRODUCT-ID';

// Your store name (for display purposes)
export const STORE_NAME = 'Strategia-X';

/**
 * License key format validation
 *
 * Accepts multiple formats:
 * - LemonSqueezy default: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (UUID-like)
 * - Custom format: STGX-XXXX-XXXX-XXXX
 * - Any alphanumeric key with at least 16 characters
 */
const LICENSE_REGEX = /^([A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}|STGX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}|[A-Z0-9-]{16,})$/i;

/**
 * Validate license key format
 */
export const isValidKeyFormat = (key: string): boolean => {
  return LICENSE_REGEX.test(key.toUpperCase().trim());
};

/**
 * Get stored license data
 */
export const getLicenseData = (): LicenseData | null => {
  try {
    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as LicenseData;
  } catch {
    return null;
  }
};

/**
 * Store license data
 */
export const storeLicenseData = (data: LicenseData): void => {
  localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(data));
};

/**
 * Remove license data (for logout/deactivation)
 */
export const clearLicenseData = (): void => {
  localStorage.removeItem(LICENSE_STORAGE_KEY);
};

/**
 * Check if user has a valid pro license
 */
export const isPro = (): boolean => {
  const license = getLicenseData();
  return license !== null && isValidKeyFormat(license.key);
};

/**
 * Activate a license key
 * In production, this would validate against LemonSqueezy API
 */
export const activateLicense = async (key: string, email?: string): Promise<{ success: boolean; error?: string }> => {
  const normalizedKey = key.toUpperCase().trim();

  // Format validation
  if (!isValidKeyFormat(normalizedKey)) {
    return {
      success: false,
      error: 'Invalid license key. Please enter the key from your purchase email.'
    };
  }

  // In production, you would validate against LemonSqueezy API here:
  // const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${API_KEY}` },
  //   body: JSON.stringify({ license_key: normalizedKey, instance_name: 'web' })
  // });

  // For MVP, we accept any correctly formatted key
  // This is fine for low-stakes apps - serious pirates will always find a way

  const licenseData: LicenseData = {
    key: normalizedKey,
    activatedAt: new Date().toISOString(),
    email,
  };

  storeLicenseData(licenseData);

  return { success: true };
};

/**
 * Deactivate/remove license
 */
export const deactivateLicense = (): void => {
  clearLicenseData();
};

// ============ USAGE TRACKING (for free tier limits) ============

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current usage data
 */
export const getUsageData = (): UsageData => {
  try {
    const stored = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!stored) {
      return {
        generationsToday: 0,
        lastGenerationDate: getToday(),
        savedIdeasCount: 0,
      };
    }
    const data = JSON.parse(stored) as UsageData;

    // Reset daily count if it's a new day
    if (data.lastGenerationDate !== getToday()) {
      data.generationsToday = 0;
      data.lastGenerationDate = getToday();
      storeUsageData(data);
    }

    return data;
  } catch {
    return {
      generationsToday: 0,
      lastGenerationDate: getToday(),
      savedIdeasCount: 0,
    };
  }
};

/**
 * Store usage data
 */
export const storeUsageData = (data: UsageData): void => {
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(data));
};

/**
 * Increment generation count
 */
export const recordGeneration = (): void => {
  const usage = getUsageData();
  usage.generationsToday += 1;
  usage.lastGenerationDate = getToday();
  storeUsageData(usage);
};

/**
 * Update saved ideas count
 */
export const updateSavedCount = (count: number): void => {
  const usage = getUsageData();
  usage.savedIdeasCount = count;
  storeUsageData(usage);
};

/**
 * Check if user can generate (free tier: 3/day)
 */
export const canGenerate = (): boolean => {
  if (isPro()) return true;
  const usage = getUsageData();
  return usage.generationsToday < 3;
};

/**
 * Check if user can save (free tier: 3 max)
 */
export const canSave = (currentSavedCount: number): boolean => {
  if (isPro()) return true;
  return currentSavedCount < 3;
};

/**
 * Get remaining generations for today (free tier)
 */
export const getRemainingGenerations = (): number => {
  if (isPro()) return Infinity;
  const usage = getUsageData();
  return Math.max(0, 3 - usage.generationsToday);
};

// ============ FEATURE FLAGS ============

export type ProFeature =
  | 'unlimited_generations'
  | 'deep_analysis'
  | 'image_generation'
  | 'comparison'
  | 'export'
  | 'unlimited_saves';

/**
 * Check if a specific feature is available
 */
export const hasFeature = (feature: ProFeature): boolean => {
  if (isPro()) return true;

  // Free tier features
  switch (feature) {
    case 'unlimited_generations':
    case 'deep_analysis':
    case 'image_generation':
    case 'comparison':
    case 'export':
    case 'unlimited_saves':
      return false;
    default:
      return false;
  }
};
