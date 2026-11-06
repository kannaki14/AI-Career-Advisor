export const API_BASE = 'http://127.0.0.1:8000';

export function getLoggedInUser() {
  try {
    const raw = sessionStorage.getItem('user');
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    if (parsed.id != null) return parsed;
    if (parsed.user && parsed.user.id != null) return parsed.user;

    return null;
  } catch {
    return null;
  }
}

export function getLoggedInUserId() {
  const user = getLoggedInUser();
  const userId = Number(user?.id);

  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export function asRecommendationList(payload) {
  if (Array.isArray(payload)) return payload;

  if (payload && Array.isArray(payload.recommendations)) {
    return payload.recommendations;
  }

  return [];
}
export function getUserStorageKey(key) {
  const userId = getLoggedInUserId();

  if (!userId) return null;

  return `${key}_${userId}`;
}

export function getUserStorageItem(key) {
  const storageKey = getUserStorageKey(key);

  if (!storageKey) return null;

  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function setUserStorageItem(key, value) {
  const storageKey = getUserStorageKey(key);

  if (!storageKey) return false;

  try {
    localStorage.setItem(storageKey, value);
    return true;
  } catch {
    return false;
  }
}