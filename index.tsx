
/**
 * Entry point for the Lyria Studio React application.
 * 
 * This file is responsible for bootstrapping the React application by
 * finding the root DOM element and rendering the main App component
 * inside a React.StrictMode wrapper for additional development checks.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AudioSessionProvider } from '@seihouse/audio-player';
import '@seihouse/audio-player/styles.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AudioSessionProvider>
      <App />
    </AudioSessionProvider>
  </React.StrictMode>
);
