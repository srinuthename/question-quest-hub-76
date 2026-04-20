const parseWithFallback = <T>(raw: string | null, fallback: T): T => {
  if (raw === null) return fallback;
  if (typeof fallback === 'boolean') {
    return (raw === 'true') as T;
  }
  if (typeof fallback === 'number') {
    const parsed = Number(raw);
    return (Number.isFinite(parsed) ? parsed : fallback) as T;
  }
  if (typeof fallback === 'string') {
    return raw as T;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const stringifyValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value ?? null);
};

export const readMirroredAdminSettingSync = <T>(key: string, fallback: T): T =>
  parseWithFallback<T>(localStorage.getItem(key), fallback);

export const readMirroredAdminSetting = async <T>(key: string, fallback: T): Promise<T> =>
  readMirroredAdminSettingSync(key, fallback);

export const writeMirroredAdminSetting = async (key: string, value: unknown): Promise<void> => {
  localStorage.setItem(key, stringifyValue(value));
};

export const mirrorLocalStorageKeysToIndexedDb = async (_keys: string[]): Promise<void> => {
  // No-op: IndexedDB mirroring removed
};

export const saveQuizSessionConfigSnapshot = (sessionId: string, snapshot: Record<string, unknown>): void => {
  const payload = {
    sessionId,
    savedAt: Date.now(),
    snapshot,
  };
  localStorage.setItem(`quizSessionConfigSnapshot:${sessionId}`, JSON.stringify(payload));
  localStorage.setItem('latestQuizSessionConfigSnapshot', JSON.stringify(payload));
};
