import ReactDOM from 'react-dom/client';
import App from './App';

// Register the Service Worker
if ('serviceWorker' in navigator)
{
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' }) // Ensure the path to sw.js matches your setup
    .then((registration) =>
    {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) =>
    {
      console.error('Service Worker registration failed:', error);
    });
}

if (import.meta.env.PROD)
{
  console.log = () => { };  // Disable all console.log calls in production
}


// Using `createRoot` for React 18+
const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root using createRoot
root.render(
    <App />
);
