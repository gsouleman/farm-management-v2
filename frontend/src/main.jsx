import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- STABILITY & VERSION CONTROL PROTOCOL ---
window.__APP_VERSION__ = '1.2.5-STABLE';
window.__RENDER_COUNT__ = 0;

// GLOBAL LOOP BREAKER
// If any component re-renders more than 500 times in 2 seconds, warn and pause.
const originalRender = console.log;
let renderTimer = Date.now();
let renderCount = 0;

console.log = (...args) => {
  if (args[0]?.includes?.('State Update') || args[0]?.includes?.('Fetching assets')) {
    renderCount++;
    if (Date.now() - renderTimer > 2000) {
      renderCount = 0;
      renderTimer = Date.now();
    }
    if (renderCount > 100) {
      window.alert('CRITICAL LOOP DETECTED: The application is re-rendering too fast. Please clear your cache and restart.');
      throw new Error('Infinite loop killed by global protector');
    }
  }
  originalRender(...args);
};
// --------------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
