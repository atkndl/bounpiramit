import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA Update Handler
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, refresh the page
                console.log('New content available, refreshing...');
                window.location.reload();
              }
            });
          }
        });
        
        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
      
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('Service Worker updated, refreshing page...');
        window.location.reload();
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
