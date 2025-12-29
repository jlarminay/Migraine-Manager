import type { CalendarEntry, EntryType } from '@/types';

const STORAGE_KEY = 'memoryStoreCalendarEntries';

export function isValidDay(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function isValidMonth(month: string): boolean {
  return /^\d{4}-\d{2}$/.test(month);
}

export function loadEntries(): CalendarEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e: any) =>
          e &&
          typeof e.date === 'string' &&
          isValidDay(e.date) &&
          (e.type === 'e' || e.type === 'm'),
      )
      .map((e: any) => ({ date: e.date, type: e.type as EntryType }));
  } catch {
    return [];
  }
}

export function saveEntries(entries: CalendarEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
