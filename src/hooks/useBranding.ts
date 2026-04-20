import { useState, useEffect, useCallback } from 'react';
import { BrandingConfig, DEFAULT_BRANDING, getBranding, getBrandingSync, saveBranding, generatePageTitle } from '@/config/brandingConfig';
import { loadAdminConfig } from '@/services/adminConfigApi';
import { QUIZ_HOST_CHANNEL_UPDATED_EVENT, readQuizHostChannel } from '@/lib/quizHostChannel';
import { useApp } from '@/context/AppContext';
import { getStoredApplicationId } from '@/config/hostProduct';

export interface UseBrandingReturn {
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
  pageTitle: string;
  isLoading: boolean;
}

export const useBranding = (): UseBrandingReturn => {
  const { applicationId } = useApp();
  // Start with sync read for immediate data, then update from backend + localStorage
  const [branding, setBranding] = useState<BrandingConfig>(() => getBrandingSync());
  const [isLoading, setIsLoading] = useState(true);

  // Load from backend (admin config) first, then fall back to localStorage
  useEffect(() => {
    const loadBranding = async () => {
      try {
        const appId = applicationId || getStoredApplicationId();
        const hostChannel = readQuizHostChannel();
        const hostChannelId = hostChannel.quizHostChannelId || null;
        
        // Try to load from backend admin config first
        if (appId && hostChannelId) {
          const adminCfg = await loadAdminConfig(appId, hostChannelId);
          if (adminCfg && (adminCfg.showTitle || adminCfg.logoUrl || adminCfg.episodeNumber)) {
            const brandingFromConfig: BrandingConfig = {
              showTitle: adminCfg.showTitle || DEFAULT_BRANDING.showTitle,
              logoUrl: adminCfg.logoUrl || DEFAULT_BRANDING.logoUrl,
              channelName: adminCfg.channelName || hostChannel.quizHostChannelTitle || DEFAULT_BRANDING.channelName,
              episodePrefix: adminCfg.episodePrefix || DEFAULT_BRANDING.episodePrefix,
              episodeNumber: adminCfg.episodeNumber || DEFAULT_BRANDING.episodeNumber,
              quizName: adminCfg.quizName || DEFAULT_BRANDING.quizName,
              partnerLogos: adminCfg.partnerLogos || DEFAULT_BRANDING.partnerLogos,
            };
            setBranding(brandingFromConfig);
            setIsLoading(false);
            return;
          }
        }
        // Fall back to localStorage if backend config not found or incomplete
        const saved = await getBranding();
        setBranding(saved);
      } catch (err) {
        console.error('Failed to load branding from backend:', err);
        // Fall back to localStorage on error
        const saved = await getBranding();
        setBranding(saved);
      } finally {
        setIsLoading(false);
      }
    };

    loadBranding();
  }, [applicationId]);

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
