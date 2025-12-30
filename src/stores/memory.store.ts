import { defineStore } from 'pinia';
import type { CalendarEntry, EntryType } from '@/types';
import { isValidDay, isValidMonth, loadEntries, saveEntries } from '@/helpers';
import dayjs from 'dayjs';

export const useMemoryStore = defineStore('memory', {
  state: () => ({
    entries: [] as CalendarEntry[],
  }),

  getters: {},

  actions: {
    load() {
      console.log('Loading entries from storage');
      this.entries = loadEntries();
    },

    set(date: string, type: EntryType) {
      if (!isValidDay(date)) throw new Error("Invalid date format. Expected 'YYYY/MM/DD'.");
      if (type !== 'evening' && type !== 'morning')
        throw new Error("Invalid type. Expected 'evening' or 'morning'.");

      const idx = this.entries.findIndex((e) => e.date === date);
      if (idx >= 0) {
        this.entries.splice(idx, 1, { date, type });
      } else {
        this.entries.push({ date, type });
      }
      saveEntries(this.entries);
    },

    remove(date: string) {
      if (!isValidDay(date)) throw new Error("Invalid date format. Expected 'YYYY-MM-DD'.");
      const before = this.entries.length;
      this.entries = this.entries.filter((e) => e.date !== date);
      if (this.entries.length !== before) {
        saveEntries(this.entries);
      }
    },

    getAll(): CalendarEntry[] {
      return [...this.entries];
    },

    getMonth(year: number, month: number): CalendarEntry[] {
      this.load();
      const monthStr = month.toString().padStart(2, '0');
      const yearMonth = `${year}/${monthStr}`;
      if (!isValidMonth(yearMonth)) {
        throw new Error('Invalid year/month format. Expected 4-digit year and 1-2 digit month.');
      }
      console.log(this.entries);
      return this.entries.filter((e) => {
        const entryDate = dayjs(e.date, 'YYYY/MM/DD');
        return entryDate.isValid() && entryDate.year() === year && entryDate.month() + 1 === month;
      });
    },
    getYear(year: number): CalendarEntry[] {
      this.load();
      return this.entries.filter((e) => {
        const entryDate = dayjs(e.date, 'YYYY/MM/DD');
        return entryDate.isValid() && entryDate.year() === year;
      });
    },

    clearMemory() {
      this.entries = [];
      saveEntries(this.entries);
    },
  },
});
