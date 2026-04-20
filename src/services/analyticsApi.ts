import { getQuizDomainApiBaseUrl, getAppMode } from '@/config/appMode';
import { getAppAccessHeaders } from '@/config/hostProduct';

const getBaseUrl = (): string => {
  if (getAppMode() === 'offline') {
    throw new Error('Offline mode');
  }
  const baseUrl = getQuizDomainApiBaseUrl().replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('Backend unavailable');
  }
  return baseUrl;
};

const getAuthorizedHeaders = (headers?: HeadersInit): Headers =>
  getAppAccessHeaders(headers);

let analyticsScope: { applicationId: string; ownerId: string; quizHostChannelId: string } = {
  applicationId: '',
  ownerId: '',
  quizHostChannelId: '',
};

export const setAnalyticsScope = (scope: { applicationId?: string | null; ownerId?: string | null; quizHostChannelId?: string | null }) => {
  analyticsScope = {
    applicationId: String(scope.applicationId || '').trim(),
    ownerId: String(scope.ownerId || '').trim(),
    quizHostChannelId: String(scope.quizHostChannelId || '').trim(),
  };
};

const getScopeParams = (): URLSearchParams => {
  const params = new URLSearchParams();
  const applicationId = analyticsScope.applicationId;
  const ownerId = analyticsScope.ownerId;
  const quizHostChannelId = analyticsScope.quizHostChannelId;
  if (applicationId) params.set('applicationId', applicationId);
  if (ownerId) params.set('ownerId', ownerId);
  if (quizHostChannelId) params.set('quizHostChannelId', quizHostChannelId);
  return params;
};

export interface AnalyticsTopPerformer {
  odytChannelId: string;
  userName: string;
  displayName?: string;
  avatarUrl?: string;
  quizzesPlayed: number;
  totalScore: number;
  totalCorrectAnswers: number;
  totalResponses: number;
  firstPlaces: number;
  secondPlaces: number;
  thirdPlaces: number;
  top10Places?: number;
  bestRank: number;
  lastPlayedAt?: string;
}

export interface AnalyticsOverview {
  totalCompletedQuizzes: number;
  totalScoreAwarded: number;
  totalResponses: number;
  totalViewerEntries: number;
  totalUniqueViewers: number;
  topPerformers: AnalyticsTopPerformer[];
  episodeKpis?: AnalyticsEpisodeKpi[];
}

export interface AnalyticsEpisodeKpi {
  frontendQuizGameId: string;
  episodeName: string;
  episodeNumber?: string;
  endedAt?: string;
  overallAccuracyPct: number;
  meanViewerAccuracyPct: number;
  medianViewerAccuracyPct: number;
  avgViewerResponseMs: number;
  topScorerName: string;
  topScorerScore: number;
  fastestAvgResponderName: string;
  fastestAvgResponseMs: number;
  viewersAccuracyAtLeast50Pct: number;
  scoreConcentrationTop1Pct: number;
  totalScoreAwarded: number;
  totalResponses: number;
  totalUniqueViewers: number;
  totalQuestions: number;
}

export interface ViewerAnalyticsRow {
  odytChannelId: string;
  userName: string;
  displayName?: string;
  avatarUrl?: string;
  quizzesPlayed: number;
  totalScore: number;
  totalCorrectAnswers: number;
  totalResponses: number;
  avgResponseTimeMs: number;
  firstPlaces: number;
  secondPlaces: number;
  thirdPlaces: number;
  top10Places?: number;
  bestRank: number;
  lastPlayedAt?: string;
}

export interface ViewerDrilldownSession {
  frontendQuizGameId: string;
  episodeName: string;
  episodeNumber?: string;
  endedAt?: string;
  totalQuestions: number;
  totalDurationSeconds: number;
  rank: number;
  totalScore: number;
  correctAnswers: number;
  totalResponses: number;
  avgResponseTimeMs: number;
  fastestResponseMs?: number | null;
  supportingTeam?: string;
}

export interface ViewerDrilldownData {
  summary: ViewerAnalyticsRow & { lastPlayedAt?: string };
  sessions: ViewerDrilldownSession[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getAnalyticsOverview = async (
  scopeOverrides: { quizHostChannelId?: string | null } = {}
): Promise<ApiResponse<AnalyticsOverview>> => {
  try {
    const params = getScopeParams();
    if (scopeOverrides.quizHostChannelId) params.set('quizHostChannelId', String(scopeOverrides.quizHostChannelId));
    const response = await fetch(`${getBaseUrl()}/api/analytics/overview?${params.toString()}`, {
      credentials: 'include',
      headers: getAuthorizedHeaders(),
    });
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    return (await response.json()) as ApiResponse<AnalyticsOverview>;
  } catch (error) {
    console.error('[AnalyticsAPI] Failed to fetch overview:', error);
    return { success: false, error: 'Network error' };
  }
};

export const getViewerAnalytics = async (
  page = 1,
  limit = 25,
  search = '',
  scopeOverrides: { quizHostChannelId?: string | null } = {}
): Promise<
  ApiResponse<{
    viewers: ViewerAnalyticsRow[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>
> => {
  try {
    const params = getScopeParams();
    if (scopeOverrides.quizHostChannelId) params.set('quizHostChannelId', String(scopeOverrides.quizHostChannelId));
    params.set('page', String(page));
    params.set('limit', String(limit));
    params.set('search', search);
    params.set('sortBy', 'totalScore');
    params.set('sortOrder', 'desc');
    const response = await fetch(`${getBaseUrl()}/api/analytics/viewers?${params.toString()}`, {
      credentials: 'include',
      headers: getAuthorizedHeaders(),
    });
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    return (await response.json()) as ApiResponse<{
      viewers: ViewerAnalyticsRow[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }>;
  } catch (error) {
    console.error('[AnalyticsAPI] Failed to fetch viewer analytics:', error);
    return { success: false, error: 'Network error' };
  }
};

export const getViewerDrilldown = async (
  viewerId: string,
  limit = 30,
  scopeOverrides: { quizHostChannelId?: string | null } = {}
): Promise<ApiResponse<ViewerDrilldownData>> => {
  try {
    const params = getScopeParams();
    if (scopeOverrides.quizHostChannelId) params.set('quizHostChannelId', String(scopeOverrides.quizHostChannelId));
    params.set('limit', String(limit));
    const response = await fetch(
      `${getBaseUrl()}/api/analytics/viewers/${encodeURIComponent(viewerId)}?${params.toString()}`,
      {
        credentials: 'include',
        headers: getAuthorizedHeaders(),
      }
    );
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    return (await response.json()) as ApiResponse<ViewerDrilldownData>;
  } catch (error) {
    console.error('[AnalyticsAPI] Failed to fetch viewer drilldown:', error);
    return { success: false, error: 'Network error' };
  }
};

export interface QuizRunLifecyclePayload {
  frontendQuizGameId: string;
  applicationId?: string | null;
  analyticsOwnerId?: string | null;
  quizHostChannelId?: string | null;
  quizHostChannelTitle?: string | null;
  quizHostChannelHandle?: string | null;
  consentEnabled?: boolean;
  eventType: 'created' | 'closed' | 'ended' | 'aborted';
  clientTs?: number;
  gameTitle?: string;
  episodeName?: string;
  episodeNumber?: string;
  metadata?: unknown;
}

export interface QuizAnswerActionPayload {
  actionId: string;
  questionId?: string | null;
  questionIndex?: number | null;
  actionType:
    | 'scored_answer'
    | 'accepted_answer'
    | 'accepted_support'
    | 'accepted_prediction'
    | 'accepted_emoji'
    | 'rejected_invalid_event'
    | 'rejected_duplicate_event'
    | 'rejected_duplicate_answer'
    | 'rejected_duplicate_support'
    | 'rejected_no_question_open'
    | 'rejected_before_open'
    | 'rejected_after_close'
    | 'rejected_invalid_format';
  rejectionReason?: string | null;
  eventType?: string;
  streamId?: string | null;
  odytChannelId?: string | null;
  userName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  rawAnswer?: string | null;
  normalizedAnswer?: string | null;
  supportingTeam?: string | null;
  predictedTeam?: string | null;
  responseTimeMs?: number | null;
  isCorrect?: boolean | null;
  awardedScore?: number | null;
  questionRank?: number | null;
  cumulativeTotalScore?: number | null;
  cumulativeCorrectAnswers?: number | null;
  cumulativeTotalResponses?: number | null;
  cumulativeAvgResponseTimeMs?: number | null;
  cumulativeRank?: number | null;
  eventServerTs?: number | null;
  eventYoutubeTs?: number | null;
  eventReceivedAtYt?: string | null;
  eventServerSeq?: number | null;
  questionOpenedAt?: number | null;
  questionClosedAt?: number | null;
  clientCapturedAt?: number | null;
  payload?: unknown;
}

export const postQuizRunLifecycle = async (payload: QuizRunLifecyclePayload): Promise<ApiResponse<{ skipped?: boolean }>> => {
  if (getAppMode() === 'offline') {
    return { success: true, data: { skipped: true } };
  }
  try {
    const response = await fetch(`${getBaseUrl()}/api/analytics/quiz-runs/lifecycle`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthorizedHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    return (await response.json()) as ApiResponse<{ skipped?: boolean }>;
  } catch (error) {
    console.error('[AnalyticsAPI] Failed to post quiz run lifecycle:', error);
    return { success: false, error: 'Network error' };
  }
};

export const postAnswerActionsBatch = async (payload: {
  frontendQuizGameId: string;
  applicationId?: string | null;
  analyticsOwnerId?: string | null;
  consentEnabled?: boolean;
  actions: QuizAnswerActionPayload[];
}): Promise<ApiResponse<{ accepted?: number; duplicates?: number; skipped?: boolean }>> => {
  if (getAppMode() === 'offline') {
    return { success: true, data: { skipped: true } };
  }
  try {
    const response = await fetch(`${getBaseUrl()}/api/analytics/answer-actions/batch`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthorizedHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    return (await response.json()) as ApiResponse<{ accepted?: number; duplicates?: number; skipped?: boolean }>;
  } catch (error) {
    console.error('[AnalyticsAPI] Failed to post answer actions batch:', error);
    return { success: false, error: 'Network error' };
  }
};

export interface AnalyticsQuizRunRow {
  frontendQuizGameId: string;
  applicationId?: string | null;
  analyticsOwnerId?: string | null;
  status: 'created' | 'closed' | 'ended' | 'aborted';
  gameTitle?: string;
  episodeName?: string;
  episodeNumber?: string;
  createdAtServer?: string;
  closedAtServer?: string;
  updatedAt?: string;
}

export interface QuizRunUserSummaryRow {
  odytChannelId: string;
  userName?: string;
  displayName?: string;
  avatarUrl?: string;
  totalActions: number;
  acceptedAnswers: number;
  rejectedActions: number;
  firstActionAt?: string;
  lastActionAt?: string;
}

export interface QuizRunActionRow {
  actionId: string;
  questionId?: string | null;
  questionIndex?: number | null;
  actionType: string;
  rejectionReason?: string | null;
  odytChannelId?: string | null;
  userName?: string | null;
  displayName?: string | null;
  rawAnswer?: string | null;
  normalizedAnswer?: string | null;
  responseTimeMs?: number | null;
  eventServerTs?: number | null;
  eventServerSeq?: number | null;
  ingestedAt?: string;
}

export const getAnalyticsQuizRuns = async (
  page = 1,
  limit = 20,
  status = '',
  scopeOverrides: { quizHostChannelId?: string | null } = {}
): Promise<ApiResponse<{ runs: AnalyticsQuizRunRow[]; page: number; limit: number; total: number; totalPages: number }>> => {
  try {
    const params = getScopeParams();
    if (scopeOverrides.quizHostChannelId) params.set('quizHostChannelId', String(scopeOverrides.quizHostChannelId));
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status) params.set('status', status);
    const response = await fetch(`${getBaseUrl()}/api/analytics/quiz-runs?${params.toString()}`, {
      credentials: 'include',
      headers: getAuthorizedHeaders(),
    });
    if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
    return (await response.json()) as ApiResponse<{ runs: AnalyticsQuizRunRow[]; page: number; limit: number; total: number; totalPages: number }>;
  } catch (error) {
    console.error('[AnalyticsAPI] Failed to fetch quiz runs:', error);
    return { success: false, error: 'Network error' };
  }
};

export const getQuizRunUsers = async (
  frontendQuizGameId: string,
  limit = 100,
  search = ''
): Promise<ApiResponse<{ users: QuizRunUserSummaryRow[] }>> => {
  try {
    const params = getScopeParams();
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    const response = await fetch(
      `${getBaseUrl()}/api/analytics/quiz-runs/${encodeURIComponent(frontendQuizGameId)}/users?${params.toString()}`,
      {
        credentials: 'include',
        headers: getAuthorizedHeaders(),
      }
    );
    if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
    return (await response.json()) as ApiResponse<{ users: QuizRunUserSummaryRow[] }>;
  } catch (error) {
    console.error('[AnalyticsAPI] Failed to fetch quiz run users:', error);
    return { success: false, error: 'Network error' };
  }
};

export const getQuizRunActions = async (
  frontendQuizGameId: string,
  options: {
    page?: number;
    limit?: number;
    odytChannelId?: string;
    actionType?: string;
    questionIndex?: number | '';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<{ actions: QuizRunActionRow[]; page: number; limit: number; total: number; totalPages: number }>> => {
  try {
    const params = getScopeParams();
    params.set('page', String(options.page || 1));
    params.set('limit', String(options.limit || 100));
    if (options.odytChannelId) params.set('odytChannelId', options.odytChannelId);
    if (options.actionType) params.set('actionType', options.actionType);
    if (options.questionIndex !== undefined && options.questionIndex !== '') {
      params.set('questionIndex', String(options.questionIndex));
    }
    if (options.sortOrder) params.set('sortOrder', options.sortOrder);
    const response = await fetch(
      `${getBaseUrl()}/api/analytics/quiz-runs/${encodeURIComponent(frontendQuizGameId)}/actions?${params.toString()}`,
      {
        credentials: 'include',
        headers: getAuthorizedHeaders(),
      }
    );
    if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
    return (await response.json()) as ApiResponse<{ actions: QuizRunActionRow[]; page: number; limit: number; total: number; totalPages: number }>;
  } catch (error) {
    console.error('[AnalyticsAPI] Failed to fetch quiz run actions:', error);
    return { success: false, error: 'Network error' };
  }
};
