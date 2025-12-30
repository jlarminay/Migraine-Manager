import { defineStore } from 'pinia';
import type { CalendarEntry, EntryType } from '@/types';
import { isValidDay, isValidMonth, loadEntries, saveEntries } from '@/helpers';
import dayjs from 'dayjs';

// Capacitor imports
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Dialog } from '@capacitor/dialog';

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

    /**
     * Export entries to CSV and save to device storage (Downloads folder)
     */
    async exportToCsv() {
      const csvRows = ['date,type', ...this.entries.map((e) => `${e.date},${e.type}`)];
      const csvContent = csvRows.join('\n');
      const fileName = `migraine-entries-${dayjs().format('YYYYMMDD-HHmmss')}.csv`;
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Documents, // Or Directory.Downloads if supported
        });
        await Dialog.alert({
          title: 'Export Successful',
          message: `File saved as ${fileName} in Documents.`,
        });
      } catch (err: any) {
        await Dialog.alert({
          title: 'Export Failed',
          message: err?.message || String(err),
        });
      }
    },

    /**
     * Import entries from a CSV file in device storage
     * (Assumes file is in Documents and user provides file name)
     */
    async importFromCsv(fileName: string) {
      try {
        const result = await Filesystem.readFile({
          path: fileName,
          directory: Directory.Documents,
        });
        const csv = result.data as string;
        const lines = csv.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) throw new Error('CSV file is empty or missing data rows.');
        const [rawHeader, ...rows] = lines;
        const header = String(rawHeader ?? '').trim();
        const expectedHeader = 'date,type';
        if (header.trim().toLowerCase() !== expectedHeader) {
          throw new Error(`CSV header must be: ${expectedHeader}`);
        }
        const newEntries: CalendarEntry[] = [];
        for (const line of rows) {
          const [rawDate, rawType] = line.split(',');
          const date = String(rawDate ?? '').trim();
          const type = String(rawType ?? '').trim();
          if (isValidDay(date) && (type === 'evening' || type === 'morning')) {
            newEntries.push({ date, type } as CalendarEntry);
          }
        }
        if (newEntries.length === 0) {
          throw new Error('No valid entries found in CSV.');
        }
        this.entries = newEntries;
        saveEntries(this.entries);
        await Dialog.alert({
          title: 'Import Successful',
          message: `Imported ${newEntries.length} entries from ${fileName}.`,
        });
      } catch (err: any) {
        await Dialog.alert({
          title: 'Import Failed',
          message: err?.message || String(err),
        });
      }
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
