import { defineStore } from 'pinia';
import type { CalendarEntry } from '@/types';

export type AiProvider = 'gemini' | 'openai' | 'claude' | 'ollama';

const STORAGE_KEY = 'aiStoreSettings';
const CACHE_KEY = 'aiStoreCache';

interface AiSettings {
  enabled: boolean;
  provider: AiProvider;
  keys: {
    gemini: string;
    openai: string;
    claude: string;
  };
  ollamaUrl: string;
  ollamaModel: string;
}

interface AiCache {
  response: string | null;
  lastAnalyzedAt: string | null; // ISO 8601
}

function defaultSettings(): AiSettings {
  return {
    enabled: false,
    provider: 'gemini',
    keys: { gemini: '', openai: '', claude: '' },
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: '',
  };
}

function loadSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw);
    const defaults = defaultSettings();
    return {
      enabled: parsed.enabled ?? defaults.enabled,
      provider: parsed.provider ?? defaults.provider,
      keys: { ...defaults.keys, ...parsed.keys },
      ollamaUrl: parsed.ollamaUrl ?? defaults.ollamaUrl,
      ollamaModel: parsed.ollamaModel ?? defaults.ollamaModel,
    };
  } catch {
    return defaultSettings();
  }
}

function saveSettings(settings: AiSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadCache(): AiCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { response: null, lastAnalyzedAt: null };
    return JSON.parse(raw);
  } catch {
    return { response: null, lastAnalyzedAt: null };
  }
}

function saveCache(cache: AiCache): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export const useAiStore = defineStore('ai', {
  state: () => ({
    ...(loadSettings() as AiSettings),
    ...(loadCache() as AiCache),
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    currentKey(state): string {
      if (state.provider === 'ollama') return '';
      return state.keys[state.provider as keyof typeof state.keys] ?? '';
    },
    hasKey(state): boolean {
      if (state.provider === 'ollama') return !!state.ollamaUrl;
      return !!(state.keys[state.provider as keyof typeof state.keys] ?? '');
    },
  },

  actions: {
    setEnabled(value: boolean) {
      this.enabled = value;
      this._save();
    },

    clearKey() {
      this.keys[this.provider as keyof typeof this.keys] = '';
      this.enabled = false;
      this._save();
    },

    setProvider(provider: AiProvider) {
      this.provider = provider;
      this._save();
    },

    setKey(provider: AiProvider, key: string) {
      if (provider !== 'ollama') {
        this.keys[provider as keyof typeof this.keys] = key;
        this._save();
      }
    },

    setOllamaUrl(url: string) {
      this.ollamaUrl = url;
      this._save();
    },

    setOllamaModel(model: string) {
      this.ollamaModel = model;
      this._save();
    },

    clearResponse() {
      this.response = null;
      this.lastAnalyzedAt = null;
      this.error = null;
      saveCache({ response: null, lastAnalyzedAt: null });
    },

    _save() {
      saveSettings({
        enabled: this.enabled,
        provider: this.provider,
        keys: { ...this.keys },
        ollamaUrl: this.ollamaUrl,
        ollamaModel: this.ollamaModel,
      });
    },

    _buildPrompt(entries: CalendarEntry[]): string {
      const sorted = [...entries].sort((a, b) => (a.date > b.date ? 1 : -1));
      const list = sorted.map((e) => `${e.date} (${e.type})`).join('\n');

      return `You are a helpful migraine pattern analyst. The user has been tracking their migraines using a simple app. Each entry has a date (YYYY/MM/DD) and a time of day: "morning" or "evening".

Here is the full migraine history:
${list || 'No entries recorded yet.'}

Please analyze this data and provide:
1. Patterns by day of week
2. Patterns by time of day (morning vs evening)
3. Any seasonal or monthly trends
4. Notable clusters or streaks
5. Any general theories or lifestyle suggestions based on the timing patterns

Keep your response concise, minimal, and practical. If there is not enough data to draw conclusions, say so clearly. Return your response as markdown-formatted text.`;
    },

    async analyze(entries: CalendarEntry[]) {
      if (this.provider === 'ollama') {
        if (!this.ollamaUrl) {
          this.error = 'No Ollama URL set. Add one in Settings.';
          return;
        }
      } else {
        const key = this.keys[this.provider as keyof typeof this.keys];
        if (!key) {
          this.error = `No API key set for ${this.provider}. Add one in Settings.`;
          return;
        }
      }

      this.isLoading = true;
      this.error = null;
      this.response = null;

      try {
        const prompt = this._buildPrompt(entries);
        const key =
          this.provider !== 'ollama' ? this.keys[this.provider as keyof typeof this.keys] : '';

        if (this.provider === 'gemini') {
          this.response = await this._callGemini(key, prompt);
        } else if (this.provider === 'openai') {
          this.response = await this._callOpenAI(key, prompt);
        } else if (this.provider === 'claude') {
          this.response = await this._callClaude(key, prompt);
        } else if (this.provider === 'ollama') {
          this.response = await this._callOllama(this.ollamaUrl, prompt);
        }

        this.lastAnalyzedAt = new Date().toISOString();
        saveCache({ response: this.response, lastAnalyzedAt: this.lastAnalyzedAt });
      } catch (err: any) {
        this.error = err?.message || String(err);
      } finally {
        this.isLoading = false;
      }
    },

    async _callGemini(key: string, prompt: string): Promise<string> {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `Gemini error ${res.status}`);
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response received.';
    },

    async _callOpenAI(key: string, prompt: string): Promise<string> {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `OpenAI error ${res.status}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? 'No response received.';
    },

    async _callClaude(key: string, prompt: string): Promise<string> {
      // anthropic-dangerous-direct-browser-access is required for client-side calls with a user-supplied key
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `Claude error ${res.status}`);
      }
      const data = await res.json();
      return data.content?.[0]?.text ?? 'No response received.';
    },

    async _callOllama(baseUrl: string, prompt: string): Promise<string> {
      const url = baseUrl.replace(/\/$/, '') + '/api/generate';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'identity' },
        body: JSON.stringify({ model: this.ollamaModel || 'llama3.2', prompt }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Ollama error ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n')) {
          if (!line) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.response) {
              result += chunk.response;
              this.response = result;
            }
            if (chunk.done) return result;
          } catch {}
        }
      }

      return result || 'No response received.';
    },
  },
});
