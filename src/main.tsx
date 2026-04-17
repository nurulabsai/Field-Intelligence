import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { registerServiceWorker } from './lib/swRegistration';
import { initOffline } from './store/index';
import './styles/main.css';

// Validate env vars at startup (fails fast with clear errors)
import './lib/env';

// Catch unhandled promise rejections that escape React's ErrorBoundary
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

registerServiceWorker();
initOffline();
