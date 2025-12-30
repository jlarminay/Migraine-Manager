import { defineStore } from 'pinia';
import type { CalendarEntry, EntryType } from '@/types';
import { toaster, isValidDay, isValidMonth, loadEntries, saveEntries } from '@/helpers';
import dayjs from 'dayjs';

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export const useMemoryStore = defineStore('memory', {
  state: () => ({
    entries: [] as CalendarEntry[],
  }),

  getters: {},

  actions: {
    load() {
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

    async export() {
      try {
        const header = 'date,type\n';
        const rows = this.entries
          .map((e) => `${e.date},${e.type}`)
          .sort()
          .join('\n');

        const csv = header + rows;
        const filename = `backup-${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`;

        // Download for web, save to file for native
        if (!Capacitor.isNativePlatform()) {
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();

          URL.revokeObjectURL(url);
          toaster('success', `Downloaded as ${filename}`);
          return;
        }

        // Native platforms
        await Filesystem.writeFile({
          path: `MigraineManager/${filename}`,
          data: csv,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });
        toaster('success', `Saved as ${filename}`);
      } catch (err: any) {
        toaster('error', `Export failed: ${err?.message || String(err)}`);
      }
    },
    async import(file: File) {
      try {
        const text = await file.text();
        const lines = text.split('\n').map((l) => l.trim());
        const newEntries: CalendarEntry[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;

          const [date, type] = line.split(',') as [string, string];

          if (isValidDay(date) && (type === 'evening' || type === 'morning')) {
            newEntries.push({ date, type: type as EntryType });
          }
        }

        this.entries = newEntries;
        saveEntries(this.entries);
        toaster('success', `Imported ${newEntries.length} entries.`);
      } catch (err: any) {
        toaster('error', err?.message || String(err));
      }
    },
  },
});
