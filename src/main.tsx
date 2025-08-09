import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import LoadingScreen from './LoadingScreen';
import './index.css';

// Lazy load the main App component for better initial load performance
const App = lazy(() => import('./App'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
  </React.StrictMode>,
);
