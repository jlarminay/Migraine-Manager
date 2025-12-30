import type { CalendarEntry, EntryType } from '@/types';

// @ts-ignore
import { createToaster } from '@meforma/vue-toaster';

const toasterObject = createToaster({
  position: 'top',
  duration: 3000,
});

const STORAGE_KEY = 'memoryStoreCalendarEntries';

export function isValidDay(date: string): boolean {
  return /^\d{4}\/\d{2}\/\d{2}$/.test(date);
}

export function isValidMonth(month: string): boolean {
  return /^\d{4}\/\d{2}$/.test(month);
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
          (e.type === 'evening' || e.type === 'morning'),
      )
      .map((e: any) => ({ date: e.date, type: e.type as EntryType }));
  } catch {
    return [];
  }
}

export function saveEntries(entries: CalendarEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function toaster(type: 'success' | 'error', message: string) {
  if (type === 'error') {
    toasterObject.error(`
      <p>Import failed</p>
      <span>${message}</span>
    `);
  } else {
    toasterObject.success(`
      <p>Success</p>
      <span>${message}</span>
    `);
  }

  return;
}
