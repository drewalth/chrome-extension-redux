import { store } from './store';

// Initialize data when extension is installed or updated
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed or updated:', details.reason);
  
  try {
    // Initialize the store with data from storage or network
    await store.getState().initialize();
    console.log('Store initialized successfully');
  } catch (error) {
    console.error('Failed to initialize store:', error);
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  console.log('Background script received message:', message);
  
  if (message.action === 'FETCH_DATA') {
    // Use the store to fetch data
    store.getState().fetchData()
      .then(data => {
        sendResponse({ success: true, data });
      })
      .catch(error => {
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  if (message.action === 'GET_CACHED_DATA') {
    // Return current data from the store
    const { data, lastUpdated } = store.getState();
    sendResponse({ success: true, data, lastUpdated });
    return true;
  }
  
  if (message.action === 'CLEAR_CACHE') {
    store.getState().clearCache()
      .then(() => {
        sendResponse({ success: true });
        // After clearing cache, fetch fresh data
        return store.getState().fetchData();
      })
      .catch(error => {
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      });
    return true;
  }
  
  if (message.action === 'IS_DATA_STALE') {
    const isStale = store.getState().isDataStale();
    sendResponse({ isStale });
    return true;
  }
});

// Optional: Set up periodic data refresh
// This will refresh data every hour (adjust as needed)
const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

const setupPeriodicRefresh = () => {
  setInterval(async () => {
    console.log('Performing periodic data refresh');
    try {
      await store.getState().fetchData();
      console.log('Periodic refresh completed successfully');
    } catch (error) {
      console.error('Periodic refresh failed:', error);
    }
  }, REFRESH_INTERVAL);
};

// Start the periodic refresh
setupPeriodicRefresh();

// Listen for network status changes to refresh data when coming back online
self.addEventListener('online', async () => {
  console.log('Network connection restored, refreshing data');
  try {
    await store.getState().fetchData();
    console.log('Data refreshed after coming back online');
  } catch (error) {
    console.error('Failed to refresh data after coming back online:', error);
  }
});

// Log when extension goes offline
self.addEventListener('offline', () => {
  console.log('Network connection lost, will use cached data');
});

// Export for testing purposes
export {};
