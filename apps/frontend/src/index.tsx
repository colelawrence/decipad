/* eslint-disable no-underscore-dangle,func-names,no-extend-native,no-param-reassign */
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
import { Buffer } from 'buffer';
// import { registerSW } from 'virtual:pwa-register';

suppressWarnings();

// IMPORTANT.
// We removed node polyfills from the project (except for this one).
// But we import it manually instead of letting the bundler work magic for us.
globalThis.Buffer = Buffer;
if (Buffer == null) {
  throw new Error('Buffer must always be defined as a global property');
}

if (!Array.prototype.at) {
  Array.prototype.at = function (index) {
    index = Math.trunc(index) || 0;
    if (index < 0) index += this.length;
    if (index < 0 || index >= this.length) return undefined;
    return this[index];
  };
}

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
