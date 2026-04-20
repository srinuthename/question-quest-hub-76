import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  WifiOff, 
  Cloud, 
  Globe, 
  Zap,
  Server,
  Radio as RadioIcon,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AppMode, 
  APP_MODE_CONFIGS, 
  getAppMode, 
  getBackendBaseUrl,
  getBackendTarget,
  setAppMode,
  setBackendTarget,
  setSSEEnabled,
} from '@/config/appMode';

const MODE_ICONS: Record<AppMode, React.ReactNode> = {
  offline: <WifiOff className="h-5 w-5" />,
  frontend_scoring: <Zap className="h-5 w-5" />,
  backend_scoring: <Server className="h-5 w-5" />,
  online: <Cloud className="h-5 w-5" />,
};

const MODE_COLORS: Record<AppMode, string> = {
  offline: 'text-muted-foreground',
  frontend_scoring: 'text-amber-500',
  backend_scoring: 'text-blue-500',
  online: 'text-purple-500',
};

export const AppModeSelector = () => {
  const [mode, setModeState] = useState<AppMode>(getAppMode);
  const { t } = useTranslation();
  const hasConfiguredBackend = getBackendTarget() !== 'none' && getBackendBaseUrl().trim().length > 0;

  // Mode labels and descriptions from translations
  const MODE_LABELS: Record<AppMode, string> = {
    offline: t.offlineMode,
    frontend_scoring: t.frontendScoringMode,
    backend_scoring: t.backendScoringMode,
    online: t.onlineMode,
  };

  const MODE_DESCRIPTIONS: Record<AppMode, string> = {
    offline: t.offlineModeDesc,
    frontend_scoring: t.frontendScoringModeDesc,
    backend_scoring: t.backendScoringModeDesc,
    online: t.onlineModeDesc,
  };

  const MODE_BADGES: Record<AppMode, { icon: React.ReactNode; label: string }[]> = {
    offline: [
      { icon: <WifiOff className="h-3 w-3 mr-1" />, label: t.offline },
    ],
    frontend_scoring: [
      { icon: <RadioIcon className="h-3 w-3 mr-1" />, label: 'SSE' },
      { icon: <Zap className="h-3 w-3 mr-1" />, label: t.viewerScoring },
    ],
    backend_scoring: [
      { icon: <RadioIcon className="h-3 w-3 mr-1" />, label: 'SSE' },
      { icon: <Database className="h-3 w-3 mr-1" />, label: 'API' },
      { icon: <Server className="h-3 w-3 mr-1" />, label: t.backendScoringMode },
    ],
    online: [
      { icon: <Cloud className="h-3 w-3 mr-1" />, label: t.online },
    ],
  };

  useEffect(() => {
    const handleModeChange = (e: CustomEvent<AppMode>) => {
      setModeState(e.detail);
    };
    window.addEventListener('appModeChanged', handleModeChange as EventListener);
    return () => {
      window.removeEventListener('appModeChanged', handleModeChange as EventListener);
    };
  }, []);

  const handleModeChange = (newMode: AppMode) => {
    if (newMode === 'online') {
      toast.info(t.comingSoon);
      return;
    }

    if (newMode === 'backend_scoring') {
      toast.info('Backend Scoring Engine is disabled in the frontend selector for now.');
      return;
    }

    if (newMode !== 'offline' && !hasConfiguredBackend) {
      toast.error('Configure the backend URL in Admin before enabling this mode.');
      return;
    }
    
    setModeState(newMode);
    setAppMode(newMode);
    
    // Auto-adjust SSE and YouTube integration based on mode
    if (newMode === 'offline') {
      setBackendTarget('none');
      // Offline: disable SSE and YouTube
      setSSEEnabled(false);
      localStorage.setItem("youtubeIntegrationEnabled", "false");
    } else {
      // Non-offline modes require SSE - auto-enable it
      setSSEEnabled(true);
      localStorage.setItem("youtubeIntegrationEnabled", "true");
    }
    
    toast.success(`${t.switchedTo} ${MODE_LABELS[newMode]}`);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{t.appMode}</CardTitle>
        </div>
        <CardDescription>
          {t.settings}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mode Selection */}
        <RadioGroup 
          value={mode} 
          onValueChange={(v) => handleModeChange(v as AppMode)}
          className="grid gap-3"
        >
          {(Object.keys(APP_MODE_CONFIGS) as AppMode[]).map((modeKey) => {
            const isDisabled =
              modeKey === 'online' ||
              modeKey === 'backend_scoring' ||
              modeKey === 'offline' ||
              (modeKey === 'frontend_scoring' && !hasConfiguredBackend);
            const isSelected = mode === modeKey;
            const disabledBadge =
              modeKey === 'offline'
                ? 'Offline mode is disabled in Admin'
                : modeKey === 'frontend_scoring' && !hasConfiguredBackend
                  ? 'Configure backend URL'
                  : t.comingSoon;
            
            return (
              <div
                key={modeKey}
                className={`
                  flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !isDisabled && handleModeChange(modeKey)}
              >
                <RadioGroupItem 
                  value={modeKey} 
                  id={modeKey}
                  disabled={isDisabled}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={MODE_COLORS[modeKey]}>
                      {MODE_ICONS[modeKey]}
                    </span>
                    <Label 
                      htmlFor={modeKey} 
                      className="font-semibold cursor-pointer"
                    >
                      {MODE_LABELS[modeKey]}
                    </Label>
                    {isDisabled && (
                      <Badge variant="outline" className="text-xs">
                        {disabledBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {MODE_DESCRIPTIONS[modeKey]}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {MODE_BADGES[modeKey].map((badge, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {badge.icon}
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {/* Mode-specific info */}
        {mode === 'offline' && (
          <div className="p-3 rounded-lg bg-muted/50 border border-muted-foreground/20">
            <p className="text-sm text-muted-foreground">
              <strong>{t.offlineMode}:</strong> {t.offlineModeDesc}
            </p>
            {!hasConfiguredBackend && (
              <p className="mt-2 text-sm text-muted-foreground">
                To switch back to <strong>{t.frontendScoringMode}</strong>, configure backend URL in Admin first.
              </p>
            )}
          </div>
        )}

        {mode === 'frontend_scoring' && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-muted-foreground">
              <strong>{t.frontendScoringMode}:</strong> {t.frontendScoringModeDesc}
            </p>
          </div>
        )}

        {mode === 'backend_scoring' && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm text-muted-foreground">
              <strong>{t.backendScoringMode}:</strong> {t.backendScoringModeDesc}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
