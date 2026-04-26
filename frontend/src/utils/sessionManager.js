const KEY = "studyspark_session";

export const saveSession = (data) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error("Session save failed", e);
  }
};

export const loadSession = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Optional: expire after 24 hrs
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(KEY);
};