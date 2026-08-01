import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ?admin=1 loads the dev-only Section 12 content editor instead of the
// real site -- lazy-loaded so its code never ships as part of the normal
// site bundle. See src/AdminSection12.jsx and vite.config.js's
// section12ContentApi() for the dev-server-only API it talks to.
const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
const AdminSection12 = isAdmin ? lazy(() => import('./AdminSection12.jsx')) : null;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminSection12 />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
