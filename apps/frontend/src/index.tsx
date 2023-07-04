/* eslint-disable no-underscore-dangle */
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import createCache from '@emotion/cache';
import { GraphqlProvider } from '@decipad/graphql-client';
import reportWebVitals from './reportWebVitals';
import suppressWarnings from './suppressWarnings';
import AppLoader from './AppLoader';
import { requiresHydration } from './utils/requiresHydration';
import { loadCrucialDependencies } from './loadCrucialDependencies';

suppressWarnings();

const cache = createCache({ key: 'deci' });

type WindowWithSession = typeof window & {
  __SESSION__?: Session;
};

const container = document.getElementById('root');
if (container) {
  const app = (
    <StrictMode>
      <SessionProvider session={(window as WindowWithSession).__SESSION__}>
        <CacheProvider value={cache}>
          <BrowserRouter>
            <GraphqlProvider>
              <AppLoader />
            </GraphqlProvider>
          </BrowserRouter>
        </CacheProvider>
      </SessionProvider>
    </StrictMode>
  );
  if (requiresHydration()) {
    (async () => {
      try {
        await loadCrucialDependencies();
      } finally {
        hydrateRoot(container, app, {
          onRecoverableError: (err) => {
            console.error('Error caught while hydrating:', err);
          },
        });
      }
    })();
  } else {
    const root = createRoot(container);
    root.render(app);
  }
} else {
  document.body.innerHTML = 'Fatal error: Cannot find root container element.';
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

export default AppLoader;
