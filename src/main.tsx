import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Capture any unhandled errors gracefully
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.warn('Unhandled window error captured:', event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection captured:', event.reason);
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  console.error('Critical: Root DOM element #root not found!');
}
