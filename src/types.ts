export type EntryType = 'evening' | 'morning';

export interface CalendarEntry {
  date: string; // YYYY-MM-DD
  type: EntryType; // 'e' or 'm'
}
