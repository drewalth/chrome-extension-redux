import { createStore } from "zustand/vanilla";
import { Ditto, StorageData } from "./types";
import { immer } from "zustand/middleware/immer";

export type State = {
  data: Ditto | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
};

type Action = {
  initialize: () => Promise<void>;
  fetchData: () => Promise<Ditto | null>;
  saveToStorage: (data: Ditto) => Promise<void>;
  loadFromStorage: () => Promise<Ditto | null>;
  clearCache: () => Promise<void>;
  isDataStale: () => boolean;
}

type Store = State & Action;

const STORAGE_KEY = 'ditto_data';
// 24 hours in milliseconds
const CACHE_TTL = 24 * 60 * 60 * 1000;

const getInitialState = (): State => ({
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
});

export const store = createStore<Store>()(immer((set, get) => ({
    ...getInitialState(),
    initialize: async () => {
      set({ isLoading: true });
      try {
        // Try to load data from storage first
        const cachedData = await get().loadFromStorage();
        if (cachedData) {
          set({ 
            data: cachedData, 
            isLoading: false,
            lastUpdated: Date.now()
          });
        }
        
        // Then fetch fresh data (network-first strategy)
        await get().fetchData();
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        });
      }
    },
    
    fetchData: async (): Promise<Ditto | null> => {
      set({ isLoading: true });
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data: Ditto = await response.json();
        
        // Save to storage
        await get().saveToStorage(data);
        
        set({ 
          data, 
          isLoading: false,
          lastUpdated: Date.now(),
          error: null
        });
        
        return data;
      } catch (error) {
        console.error("Error fetching data:", error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch data', 
          isLoading: false 
        });
        
        // If fetch fails, we'll rely on cached data which was already loaded in initialize
        const cachedData = get().data;
        if (!cachedData) {
          set({ error: 'No data available offline' });
        }
        
        throw error;
      }
    },
    
    saveToStorage: async (data: Ditto) => {
      const storageData: StorageData = {
        data,
        timestamp: Date.now()
      };
      
      return new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ [STORAGE_KEY]: storageData }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    },
    
    loadFromStorage: async () => {
      return new Promise<Ditto | null>((resolve, reject) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          
          const storageData: StorageData | undefined = result[STORAGE_KEY];
          if (storageData?.data) {
            // Check if cache is still valid (less than 24 hours old)
            const isCacheValid = Date.now() - storageData.timestamp < CACHE_TTL;
            
            if (isCacheValid) {
              resolve(storageData.data);
            } else {
              // Cache expired
              console.log('Cache expired, will fetch fresh data');
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      });
    },
    
    clearCache: async () => {
      return new Promise<void>((resolve, reject) => {
        chrome.storage.local.remove([STORAGE_KEY], () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            set({ data: null, lastUpdated: null });
            resolve();
          }
        });
      });
    },
    
    isDataStale: () => {
      const { lastUpdated } = get();
      if (!lastUpdated) return true;
      
      return Date.now() - lastUpdated > CACHE_TTL;
    }
})));

