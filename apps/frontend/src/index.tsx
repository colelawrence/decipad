import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalStyles, LoadingLogo } from '@decipad/ui';
import reportWebVitals from './reportWebVitals';
import suppressWarnings from './suppressWarnings';

suppressWarnings();

const AppWithMeta = lazy(
  () => import(/* webpackChunkName: "app-with-meta" */ './AppWithMeta')
);

const AppLoader: React.FC = () => {
  return (
    <GlobalStyles>
      <Suspense fallback={<LoadingLogo />}>
        <AppWithMeta />
      </Suspense>
    </GlobalStyles>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <AppLoader />
    </StrictMode>
  );
} else {
  document.body.innerHTML = 'Fatal error: Cannot find root container element.';
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
