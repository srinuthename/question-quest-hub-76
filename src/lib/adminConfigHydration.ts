/**
 * Boot-time admin config hydration.
 *
 * Reads the host's saved admin workspace config from the backend and writes
 * the canonical key/value pairs into localStorage so every page (TeamQuiz,
 * QuizMirror, YouTubeLivePanel, ...) sees the host's settings on a fresh
 * device — without having to first visit Admin.
 *
 * The Admin page still owns the editing UI; this helper keeps the rest of
 * the app in sync with whatever the host saved last.
 */

import { loadAdminConfig, type AdminConfig } from '@/services/adminConfigApi';
import { readQuizHostChannel } from '@/lib/quizHostChannel';

const ADMIN_CONFIG_HYDRATED_EVENT = 'quizConfigUpdated';

const writeIfDefined = (key: string, value: unknown) => {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    localStorage.setItem(key, value);
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    localStorage.setItem(key, String(value));
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const applyConfigToLocalStorage = (cfg: AdminConfig): void => {
  if (cfg.teamConfigs) writeIfDefined('teamConfigs', cfg.teamConfigs);
  writeIfDefined('episodeNumber', cfg.episodeNumber);
  writeIfDefined('correctAnswerScore', cfg.correctAnswerScore);
  writeIfDefined('wrongAnswerPenalty', cfg.wrongAnswerPenalty);
  writeIfDefined('lifelinePenalty', cfg.lifelinePenalty);
  writeIfDefined('teamLifelines', cfg.teamLifelines);
  writeIfDefined('questionsPerCategory', cfg.questionsPerCategory);
  writeIfDefined('maxUsedCountThreshold', cfg.maxUsedCountThreshold);
  writeIfDefined('shuffleQuestions', cfg.shuffleQuestions);
  writeIfDefined('timerDuration', cfg.timerDuration);
  writeIfDefined('masterTimerDuration', cfg.masterTimerDuration);
  writeIfDefined('passedQuestionTimer', cfg.passedQuestionTimer);
  writeIfDefined('revealCountdownDuration', cfg.revealCountdownDuration);
  writeIfDefined('rapidFireDuration', cfg.rapidFireDuration);
  writeIfDefined('showActivityFeed', cfg.showActivityFeed);
  writeIfDefined('showDifficultyBadge', cfg.showDifficultyBadge);
  writeIfDefined('showSaveIndicator', cfg.showSaveIndicator);
  writeIfDefined('showToastMessages', cfg.showToastMessages);
  writeIfDefined('showIntroAnimation', cfg.showIntroAnimation);
  writeIfDefined('maskViewerResponses', cfg.maskViewerResponses);
  writeIfDefined('youtubeIntegrationEnabled', cfg.youtubeIntegrationEnabled);
  writeIfDefined('disableLivePanelDuringPowerplay', cfg.disableLivePanelDuringPowerplay);
  writeIfDefined('showYouTubeAutoPostPanel', cfg.showYouTubeAutoPostPanel);
  writeIfDefined('showEngagementHeatmap', cfg.showEngagementHeatmap);
  writeIfDefined('showViewerPredictions', cfg.showViewerPredictions);
  writeIfDefined('powerplayEnabled', cfg.powerplayEnabled);
  writeIfDefined('quizAnalyticsEnabled', cfg.quizAnalyticsEnabled);
  writeIfDefined('tickerEnabled', cfg.tickerEnabled);
  writeIfDefined('tickerMessageRegular', cfg.tickerMessageRegular);
  writeIfDefined('tickerMessagePowerplay', cfg.tickerMessagePowerplay);
  writeIfDefined('tvModeEnabled', cfg.tvModeEnabled);
  writeIfDefined('fixedLeaderboard', cfg.fixedLeaderboard);
  writeIfDefined('showSequenceNumbers', cfg.showSequenceNumbers);
  writeIfDefined('minimumCorrectScore', cfg.minimumCorrectScore);
  if (cfg.topicSettings) writeIfDefined('topicSettings', cfg.topicSettings);
};

let _hydratedForChannel: string | null | undefined;

/**
 * Hydrate localStorage from the backend admin config for the current host.
 * Idempotent per channel — safe to call on every mount.
 */
export const hydrateAdminConfigFromBackend = async (
  applicationId: string | null
): Promise<boolean> => {
  if (!applicationId) return false;
  const hostChannel = readQuizHostChannel();
  const channelKey = hostChannel.quizHostChannelId || '__no-channel__';
  if (_hydratedForChannel === channelKey) return false;
  _hydratedForChannel = channelKey;

  try {
    const cfg = await loadAdminConfig(applicationId, hostChannel.quizHostChannelId || null);
    if (!cfg) return false;
    applyConfigToLocalStorage(cfg);
    try {
      window.dispatchEvent(new CustomEvent(ADMIN_CONFIG_HYDRATED_EVENT, { detail: cfg }));
    } catch {
      // ignore
    }
    return true;
  } catch {
    // Reset gate so a future retry can succeed
    _hydratedForChannel = undefined;
    return false;
  }
};

export const resetAdminConfigHydrationGate = (): void => {
  _hydratedForChannel = undefined;
};
