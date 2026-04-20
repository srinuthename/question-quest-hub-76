import { getAppMode } from '@/config/appMode';
import { getHostProductHeaders, HOST_PRODUCT_KEY } from '@/config/hostProduct';
import { readQuizHostChannel } from '@/lib/quizHostChannel';
import type {
  QuizImportPackage,
  QuizRecord,
  QuestionRecord,
} from '@/types/quizManagement';

const LOCAL_TENANT_ID = 'local-dev-tenant';
const LOCAL_TENANT_TITLE = 'Local Dev Host';
const LOCAL_TENANT_HANDLE = 'local-dev-host';

const getQuestionBankBaseUrl = () =>
  String(
    import.meta.env.VITE_BACKEND_BASE_URL ||
      ''
  )
    .trim()
    .replace(/\/+$/, '');

const getAuthorizedHeaders = (headers?: HeadersInit) => {
  const hostChannel = readQuizHostChannel();
  return getHostProductHeaders({
    ...Object.fromEntries(new Headers(headers || {}).entries()),
    'x-tenant-id': String(hostChannel.quizHostChannelId || LOCAL_TENANT_ID).trim(),
    'x-tenant-title': String(hostChannel.quizHostChannelTitle || LOCAL_TENANT_TITLE).trim(),
    'x-tenant-handle': String(hostChannel.quizHostChannelHandle || LOCAL_TENANT_HANDLE).trim(),
  });
};

const readJsonSafe = async (response: Response) => response.json().catch(() => ({}));

const normalizeQuiz = (quiz: any): QuizRecord => {
  const now = Date.now();
  return {
    id: String(quiz?.id || '').trim(),
    quizTitle: String(quiz?.quizTitle || quiz?.id || '').trim(),
    quizDescription: String(quiz?.quizDescription || ''),
    quizLanguage: String(quiz?.quizLanguage || 'te'),
    quizTopicsList: Array.isArray(quiz?.quizTopicsList) ? quiz.quizTopicsList : [],
    rounds: Array.isArray(quiz?.rounds)
      ? quiz.rounds.map((round: any, idx: number) => ({
          roundTitle: String(round?.roundTitle || `Round ${idx + 1}`),
          roundDescription: String(round?.roundDescription || ''),
          roundOrder: Number(round?.roundOrder ?? idx + 1),
          roundType: round?.roundType || 'Generic',
          questionIds: Array.isArray(round?.questionIds)
            ? round.questionIds.map((id: unknown) => String(id || '').trim()).filter(Boolean)
            : [],
        }))
      : [],
    quizType: quiz?.quizType === 'Manual' ? 'Manual' : 'Automatic',
    isPublished: Boolean(quiz?.isPublished),
    isArchived: Boolean(quiz?.isArchived),
    createdBy: typeof quiz?.createdBy === 'string' ? quiz.createdBy : undefined,
    updatedBy: typeof quiz?.updatedBy === 'string' ? quiz.updatedBy : undefined,
    createdAt: Number(quiz?.createdAt || now),
    updatedAt: Number(quiz?.updatedAt || now),
  };
};

const normalizeQuestion = (question: any): QuestionRecord => {
  const now = Date.now();
  return {
    id: String(question?.id || '').trim(),
    quizId: String(question?.quizId || '').trim() || undefined,
    baseLanguage: String(question?.baseLanguage || 'te'),
    question: question?.question || { text: '' },
    choices: Array.isArray(question?.choices)
      ? question.choices.map((choice: any, idx: number) => ({
          choiceIndex: typeof choice?.choiceIndex === 'number' ? choice.choiceIndex : idx,
          content: choice?.content || { text: '' },
        }))
      : [],
    correctChoiceIndex: typeof question?.correctChoiceIndex === 'number' ? question.correctChoiceIndex : 0,
    answerText: String(question?.answerText || ''),
    answerImageUrl: String(question?.answerImageUrl || ''),
    answerExplanation: String(question?.answerExplanation || ''),
    translations: question?.translations || {},
    questionType: 'multiple-choice',
    difficultyLevel: question?.difficultyLevel || 'medium',
    questionTopics: Array.isArray(question?.questionTopics) ? question.questionTopics : [],
    questionTags: Array.isArray(question?.questionTags) ? question.questionTags : [],
    isActive: question?.isActive !== false,
    usedCount: Number(question?.usedCount || 0),
    createdBy: typeof question?.createdBy === 'string' ? question.createdBy : undefined,
    updatedBy: typeof question?.updatedBy === 'string' ? question.updatedBy : undefined,
    createdAt: Number(question?.createdAt || now),
    updatedAt: Number(question?.updatedAt || now),
  };
};

// ---------------------------------------------------------------------------
// Backend fetch helper
// ---------------------------------------------------------------------------

const ensureBackend = () => {
  if (getAppMode() === 'offline') {
    throw new Error('This feature requires an active backend connection');
  }
};

const fetchJson = async (path: string, options?: RequestInit) => {
  ensureBackend();
  const baseUrl = getQuestionBankBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    ...options,
    headers: getAuthorizedHeaders(options?.headers),
  });
  const json = await readJsonSafe(response);
  if (!response.ok) {
    const message =
      typeof json?.error === 'string'
        ? json.error
        : typeof json?.error?.message === 'string'
          ? json.error.message
          : `Question bank request failed (${response.status})`;
    throw new Error(message);
  }
  return json;
};

// ---------------------------------------------------------------------------
// Public API — all operations go directly to the backend
// ---------------------------------------------------------------------------

export const listQuizzes = async (): Promise<QuizRecord[]> => {
  const json = await fetchJson(
    `/api/question-bank/quizzes?applicationId=${encodeURIComponent(HOST_PRODUCT_KEY)}`
  );
  return (json.quizzes || []).map(normalizeQuiz);
};

export const getQuizById = async (quizId: string): Promise<QuizRecord | null> => {
  const loaded = await loadQuizWithQuestions(quizId);
  return loaded?.quiz || null;
};

export const getQuestionsByIds = async (ids: string[]): Promise<QuestionRecord[]> => {
  const cleanIds = Array.from(new Set(ids.map((id) => String(id || '').trim()).filter(Boolean)));
  if (!cleanIds.length) return [];
  const json = await fetchJson('/api/question-bank/questions/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId: HOST_PRODUCT_KEY, ids: cleanIds }),
  });
  return (json.questions || []).map(normalizeQuestion);
};

export const saveQuizAndQuestions = async (
  quiz: QuizRecord,
  questions: QuestionRecord[]
): Promise<void> => {
  await fetchJson('/api/question-bank/quizzes/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: HOST_PRODUCT_KEY,
      quiz: { ...quiz, updatedAt: Date.now() },
      questions: questions.map((q) => ({ ...q, updatedAt: Date.now() })),
    }),
  });
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  const id = String(quizId || '').trim();
  if (!id) return;
  await fetchJson(
    `/api/question-bank/quizzes/${encodeURIComponent(id)}?applicationId=${encodeURIComponent(HOST_PRODUCT_KEY)}`,
    { method: 'DELETE' }
  );
};

export const loadQuizWithQuestions = async (
  quizId: string
): Promise<{ quiz: QuizRecord; questions: QuestionRecord[] }> => {
  const id = String(quizId || '').trim();
  const json = await fetchJson(
    `/api/question-bank/quizzes/${encodeURIComponent(id)}?applicationId=${encodeURIComponent(HOST_PRODUCT_KEY)}`
  );
  if (!json.quiz) throw new Error('Quiz not found');
  return {
    quiz: normalizeQuiz(json.quiz),
    questions: (json.questions || []).map(normalizeQuestion),
  };
};

export const exportAllQuizzes = async (): Promise<QuizImportPackage> => {
  const json = await fetchJson(
    `/api/question-bank/export?applicationId=${encodeURIComponent(HOST_PRODUCT_KEY)}`
  );
  return {
    quizzes: (json.data?.quizzes || []).map(normalizeQuiz),
    questions: (json.data?.questions || []).map(normalizeQuestion),
  };
};

export const importQuizPackage = async (
  data: QuizImportPackage,
  mode: 'replace' | 'merge' = 'replace'
): Promise<void> => {
  const quizIdByQuestionId = new Map<string, string>();
  for (const quiz of data.quizzes || []) {
    const quizId = String(quiz?.id || '').trim();
    if (!quizId) continue;
    for (const round of Array.isArray(quiz?.rounds) ? quiz.rounds : []) {
      for (const questionId of Array.isArray(round?.questionIds) ? round.questionIds : []) {
        const normalizedQuestionId = String(questionId || '').trim();
        if (normalizedQuestionId && !quizIdByQuestionId.has(normalizedQuestionId)) {
          quizIdByQuestionId.set(normalizedQuestionId, quizId);
        }
      }
    }
  }

  await fetchJson('/api/question-bank/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: HOST_PRODUCT_KEY,
      mode,
      data: {
        quizzes: data.quizzes,
        questions: (data.questions || []).map((question) => ({
          ...question,
          quizId:
            String(question?.quizId || '').trim() ||
            quizIdByQuestionId.get(String(question?.id || '').trim()) ||
            '',
        })),
      },
    }),
  });
};

export const incrementQuestionUsedCount = async (
  questionId: string,
  delta: number = 1
): Promise<void> => {
  const id = String(questionId || '').trim();
  if (!id) return;
  await fetchJson('/api/question-bank/questions/usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId: HOST_PRODUCT_KEY, questionId: id, delta }),
  });
};

// Legacy backend sync functions — now no-ops since data is always on the backend
export const pullQuestionBankFromBackend = async (): Promise<QuizImportPackage> =>
  exportAllQuizzes();

export const pushQuestionBankToBackend = async (): Promise<void> => {
  // No-op — data is already on the backend
};
