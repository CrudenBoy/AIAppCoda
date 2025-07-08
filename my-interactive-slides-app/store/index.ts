import { create } from 'zustand';
import { GoogleGenAI } from '@google/genai';

interface AppState {
  userApiKey: string | null;
  isApiKeySet: boolean;
  aiClient: GoogleGenAI | null;
  globalError: string | null;
  setUserApiKey: (key: string | null) => void;
  setAiClient: (client: GoogleGenAI | null) => void;
  setGlobalError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userApiKey: 'user-token-123',
  isApiKeySet: true,
  aiClient: null,
  globalError: null,
  setUserApiKey: (key) => set({ userApiKey: key, isApiKeySet: true }),
  setAiClient: (client) => set({ aiClient: client }),
  setGlobalError: (error) => set({ globalError: error }),
}));
