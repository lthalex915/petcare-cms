const FREQUENT_FOODS_STORAGE_KEY = "petcare_frequent_foods";

function normalizeFoodLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function readFrequentFoods(): string[] {
  try {
    const raw = localStorage.getItem(FREQUENT_FOODS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => (typeof item === "string" ? normalizeFoodLabel(item) : ""))
      .filter((item): item is string => Boolean(item));
  } catch {
    return [];
  }
}

export function saveFrequentFoods(nextFoods: string[]): string[] {
  const deduped = Array.from(new Set(nextFoods.map(normalizeFoodLabel).filter(Boolean))).slice(0, 50);
  localStorage.setItem(FREQUENT_FOODS_STORAGE_KEY, JSON.stringify(deduped));
  return deduped;
}
