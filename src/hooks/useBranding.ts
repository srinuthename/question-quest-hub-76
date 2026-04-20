import { useState, useEffect, useCallback } from 'react';
import { BrandingConfig, DEFAULT_BRANDING, getBranding, getBrandingSync, saveBranding, generatePageTitle } from '@/config/brandingConfig';
import { QUIZ_HOST_CHANNEL_UPDATED_EVENT } from '@/lib/quizHostChannel';

export interface UseBrandingReturn {
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
  pageTitle: string;
  isLoading: boolean;
}

export const useBranding = (): UseBrandingReturn => {
  // Start with sync read for immediate local defaults / saved branding.
  const [branding, setBranding] = useState<BrandingConfig>(() => getBrandingSync());
  const [isLoading] = useState(false);

  // Listen for changes from other tabs and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quizBranding' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setBranding({ ...DEFAULT_BRANDING, ...parsed });
        } catch (err) {
          console.error('Failed to parse branding from storage event:', err);
        }
      }
    };

    // Also listen to custom event for same-tab updates
    const handleBrandingChange = async () => {
      const saved = await getBranding();
      setBranding(saved);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('brandingUpdated', handleBrandingChange);
    window.addEventListener(QUIZ_HOST_CHANNEL_UPDATED_EVENT, handleBrandingChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('brandingUpdated', handleBrandingChange);
      window.removeEventListener(QUIZ_HOST_CHANNEL_UPDATED_EVENT, handleBrandingChange);
    };
  }, []);

  const updateBranding = useCallback((config: Partial<BrandingConfig>) => {
    setBranding(prev => {
      const updated = { ...prev, ...config };
      // Save async to localStorage (backend save is handled by Admin.tsx saveAllSettings)
      saveBranding(updated).then(() => {
        // Dispatch custom event for same-tab listeners
        window.dispatchEvent(new Event('brandingUpdated'));
      }).catch(err => {
        console.error('Failed to save branding locally:', err);
      });
      return updated;
    });
  }, []);

  const resetBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING);
    saveBranding(DEFAULT_BRANDING).then(() => {
      // Dispatch custom event for same-tab listeners
      window.dispatchEvent(new Event('brandingUpdated'));
    }).catch(err => {
      console.error('Failed to reset branding:', err);
    });
  }, []);

  const pageTitle = generatePageTitle(branding);

  return {
    branding,
    updateBranding,
    resetBranding,
    pageTitle,
    isLoading,
  };
};
