import React from 'react';
import { useDittoData } from './hooks';

const App: React.FC = () => {
  const { data, isLoading, error, lastUpdated } = useDittoData();
  
  // Format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? new Date(lastUpdated).toLocaleString() 
    : 'Never';
  
  if (isLoading && !data) {
    return (
      <div className="app">
        <div className="loading">
          <p>Loading Ditto data...</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  
  if (error && !data) {
    return (
      <div className="app error">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => chrome.runtime.sendMessage({ action: "FETCH_DATA" })}>
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="app">
      <header>
        <h1>Ditto Info</h1>
        <div className="last-updated">
          Last updated: {formattedLastUpdated}
          {isLoading && <span className="refreshing"> (Refreshing...)</span>}
        </div>
      </header>
      
      {data && (
        <div className="ditto-card">
          <div className="ditto-image">
            <img 
              src={data.sprites.front_default} 
              alt="Ditto" 
              width="120" 
              height="120" 
            />
          </div>
          <div className="ditto-info">
            <h2>{data.name.toUpperCase()}</h2>
            <ul>
              <li>Height: {data.height / 10}m</li>
              <li>Weight: {data.weight / 10}kg</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="actions">
        <button 
          onClick={() => chrome.runtime.sendMessage({ action: "FETCH_DATA" })}
          disabled={isLoading}
        >
          Refresh Data
        </button>
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to clear the cache?')) {
              chrome.runtime.sendMessage({ action: "CLEAR_CACHE" });
            }
          }}
          disabled={isLoading}
        >
          Clear Cache
        </button>
      </div>
      
      {error && (
        <div className="warning">
          <p>{error}</p>
          <p>Using cached data from {formattedLastUpdated}</p>
        </div>
      )}
    </div>
  );
};

export default App;
