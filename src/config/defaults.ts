// Centralized defaults configuration
// All settings that can be reset are defined here
// This file is the single source of truth for reset functionality

import { DEFAULT_BRANDING, BrandingConfig } from './brandingConfig';
import { DEFAULT_QUIZ_SETTINGS, QuizSettings } from './quizSettings';
import { DEFAULT_LANGUAGE, Language, getTeamNames } from './translations';
import { DEFAULT_SSE_STREAM_URL } from './appMode';

export interface AppDefaults {
  // Language
  language: Language;
  
  // Quiz Settings (from quizSettings.ts)
  quizSettings: QuizSettings;
  
  // Branding (from brandingConfig.ts)
  branding: BrandingConfig;
  
  // Team configurations (names from translation based on language)
  getDefaultTeamConfigs: (lang?: Language) => TeamConfig[];
}

export interface TeamConfig {
  name: string;
  members: string[];
  avatar?: string;
}

// Get default team configs based on language
export const getDefaultTeamConfigs = (lang?: Language): TeamConfig[] => {
  const teamNames = getTeamNames();
  const count = DEFAULT_QUIZ_SETTINGS.teamCount;
  return Array.from({ length: count }, (_, i) => ({
    name: teamNames[i] || `Team ${i + 1}`,
    members: [],
  }));
};

// Combined defaults object
export const APP_DEFAULTS: AppDefaults = {
  language: DEFAULT_LANGUAGE,
  quizSettings: DEFAULT_QUIZ_SETTINGS,
  branding: DEFAULT_BRANDING,
  getDefaultTeamConfigs,
};

// All localStorage keys that should be cleared on reset
export const RESETTABLE_LOCALSTORAGE_KEYS = [
  // Team config
  'teamConfigs',
  'teamLifelinesState',
  
  // Quiz game state
  'quizGameState',
  'activeQuizSessionId',
  'viewerLeaderboard',
  
  // Custom questions editor (NOT the question bank in IndexedDB)
  'customQuestions',
  'customQuestionsEditor',
  
  // Quiz settings (these get overwritten with defaults)
  'episodeNumber',
  'correctAnswerScore',
  'wrongAnswerPenalty',
  'lifelinePenalty',
  'timerDuration',
  'masterTimerDuration',
  'passedQuestionTimer',
  'revealCountdownDuration',
  'rapidFireDuration',
  'showActivityFeed',
  'showDifficultyBadge',
  'showSaveIndicator',
  'showToastMessages',
  'showIntroAnimation',
  'youtubeIntegrationEnabled',
  'disableLivePanelDuringPowerplay',
  'showYouTubeAutoPostPanel',
  'showEngagementHeatmap',
  'showViewerPredictions',
  'maskViewerResponses',
  'powerplayEnabled',
  'tickerEnabled',
  'tickerMessageRegular',
  'tickerMessagePowerplay',
  'questionsPerCategory',
  'maxUsedCountThreshold',
  'questionImportMergeMode',
  'shuffleQuestions',
  'teamLifelines',
  'tvModeEnabled',
  'fixedLeaderboard',
  'quizAnalyticsEnabled',
  
  // Branding
  'quizBranding',
  
  // Session data
  'sessionQuestionPools',
  'sessionSubjects',
  
  // YouTube data
  'youtubeViewerLeaderboard',
  
  // Game IDs (for fresh start)
  'frontendQuizGameId',
];

// IndexedDB stores/keys to clear on reset (except questions store)
export const RESETTABLE_INDEXEDDB_STORES = [
  'sessionPool',
  'usedQuestions', 
  // 'quizSessions', // Keep history
];

// Apply all default settings to localStorage
export const applyAllDefaults = async (): Promise<void> => {
  const settings = DEFAULT_QUIZ_SETTINGS;
  const branding = DEFAULT_BRANDING;
  
  // Apply quiz settings
  localStorage.setItem('episodeNumber', settings.episodeNumber);
  localStorage.setItem('correctAnswerScore', settings.correctAnswerScore.toString());
  localStorage.setItem('wrongAnswerPenalty', settings.wrongAnswerPenalty.toString());
  localStorage.setItem('lifelinePenalty', settings.lifelinePenalty.toString());
  localStorage.setItem('timerDuration', settings.timerDuration.toString());
  localStorage.setItem('masterTimerDuration', settings.masterTimerDuration.toString());
  localStorage.setItem('passedQuestionTimer', settings.passedQuestionTimer.toString());
  localStorage.setItem('revealCountdownDuration', settings.revealCountdownDuration.toString());
  localStorage.setItem('rapidFireDuration', settings.rapidFireDuration.toString());
  localStorage.setItem('showActivityFeed', settings.showActivityFeed.toString());
  localStorage.setItem('showDifficultyBadge', settings.showDifficultyBadge.toString());
  localStorage.setItem('showSaveIndicator', settings.showSaveIndicator.toString());
  localStorage.setItem('showToastMessages', settings.showToastMessages.toString());
  localStorage.setItem('showIntroAnimation', settings.showIntroAnimation.toString());
  localStorage.setItem('youtubeIntegrationEnabled', settings.youtubeIntegrationEnabled.toString());
  localStorage.setItem('disableLivePanelDuringPowerplay', settings.disableLivePanelDuringPowerplay.toString());
  localStorage.setItem('showYouTubeAutoPostPanel', settings.showYouTubeAutoPostPanel.toString());
  localStorage.setItem('showEngagementHeatmap', settings.showEngagementHeatmap.toString());
  localStorage.setItem('showViewerPredictions', settings.showViewerPredictions.toString());
  localStorage.setItem('maskViewerResponses', settings.maskViewerResponses.toString());
  localStorage.setItem('powerplayEnabled', settings.powerplayEnabled.toString());
  localStorage.setItem('tickerEnabled', settings.tickerEnabled.toString());
  localStorage.setItem('tickerMessageRegular', settings.tickerMessageRegular);
  localStorage.setItem('tickerMessagePowerplay', settings.tickerMessagePowerplay);
  localStorage.setItem('questionsPerCategory', settings.questionsPerCategory.toString());
  localStorage.setItem('maxUsedCountThreshold', settings.maxUsedCountThreshold.toString());
  localStorage.setItem('questionImportMergeMode', settings.questionImportMergeMode.toString());
  localStorage.setItem('shuffleQuestions', settings.shuffleQuestions.toString());
  localStorage.setItem('teamLifelines', settings.teamLifelines.toString());
  localStorage.setItem('tvModeEnabled', settings.tvModeEnabled.toString());
  localStorage.setItem('fixedLeaderboard', settings.fixedLeaderboard.toString());
  localStorage.setItem('quizAnalyticsEnabled', settings.quizAnalyticsEnabled.toString());
  
  // Apply branding
  localStorage.setItem('quizBranding', JSON.stringify(branding));
  
  // Apply language
  localStorage.setItem('appLanguage', DEFAULT_LANGUAGE);

  // App mode + SSE defaults
  localStorage.setItem('appOperationMode', 'frontend_scoring');
  localStorage.setItem('sseStreamEnabled', 'true');
  localStorage.setItem('sseStreamServerUrl', DEFAULT_SSE_STREAM_URL);
  
  // Apply default team configs
  const teamConfigs = getDefaultTeamConfigs();
  localStorage.setItem('teamConfigs', JSON.stringify(teamConfigs));
  
  // Dispatch events to notify components
  window.dispatchEvent(new Event('settingsReset'));
  window.dispatchEvent(new Event('tvModeChanged'));
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: DEFAULT_LANGUAGE }));
};

// Clear IndexedDB stores that should be reset (no-op: IndexedDB no longer used)
export const clearResettableIndexedDB = async (): Promise<void> => {
  // IndexedDB usage has been removed; nothing to clear
};

// Clear all cookies except quizdb-related ones
const clearAllCookies = (): void => {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const name = cookie.split('=')[0].trim();
    // Preserve quizdb-related cookies
    if (name.toLowerCase().includes('quizdb')) continue;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${name}=; path=/; max-age=0; domain=${window.location.hostname}; SameSite=Lax`;
  }
};

// Full reset function - clears everything and applies defaults
export const performFullReset = async (): Promise<void> => {
  // Clear all cookies except quizdb
  clearAllCookies();

  // Clear resettable localStorage keys
  RESETTABLE_LOCALSTORAGE_KEYS.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear resettable IndexedDB stores
  await clearResettableIndexedDB();
  
  // Clear session storage
  sessionStorage.clear();
  
  // Apply all defaults
  await applyAllDefaults();
  
  // Clear YouTube leaderboard
  try {
    const { clearYouTubeLeaderboard } = await import('@/components/YouTubeLivePanel');
    clearYouTubeLeaderboard();
  } catch (e) {
    console.warn('Failed to clear YouTube leaderboard:', e);
  }
  
  // Clear session questions
  try {
    const { clearSessionQuestions } = await import('@/lib/quizSessionManager');
    clearSessionQuestions();
  } catch (e) {
    console.warn('Failed to clear session questions:', e);
  }
  
  // Abort orphaned sessions (no-op: IndexedDB sessions removed)
  try {
    // Sessions are now managed via sessionStorage and backend
  } catch (e) {
    console.warn('Failed to abort orphaned sessions:', e);
  }
};
