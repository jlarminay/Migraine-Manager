import { defineStore } from 'pinia';
import type { CalendarEntry, EntryType } from '@/types';
import { isValidDay, isValidMonth, loadEntries, saveEntries } from '@/helpers';

export const useMemoryStore = defineStore('memory', {
  state: () => ({
    entries: loadEntries() as CalendarEntry[],
  }),

  getters: {},

  actions: {
    set(date: string, type: EntryType) {
      if (!isValidDay(date)) throw new Error("Invalid date format. Expected 'YYYY-MM-DD'.");
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

    getMonth(month: string): CalendarEntry[] {
      if (!isValidMonth(month)) throw new Error("Invalid month format. Expected 'YYYY-MM'.");
      const prefix = `${month}-`;
      return this.entries.filter((e) => e.date.startsWith(prefix));
    },
  },
});
