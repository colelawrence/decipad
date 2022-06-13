import { lazy, StrictMode, Suspense } from 'react';
// React 18
// import { createRoot } from 'react-dom/client';
import { render } from 'react-dom';
import { GlobalStyles } from '@decipad/ui';
import { Loading } from './meta/Loading';
import reportWebVitals from './reportWebVitals';
import suppressWarnings from './suppressWarnings';

suppressWarnings();

const AppWithMeta = lazy(
  () => import(/* webpackChunkName: "app-with-meta" */ './AppWithMeta')
);

const AppLoader: React.FC = () => {
  return (
    <GlobalStyles>
      <Suspense fallback={<Loading />}>
        <AppWithMeta />
      </Suspense>
    </GlobalStyles>
  );
};

const container = document.getElementById('root');
if (container) {
  // React 18
  // const root = createRoot(container);
  // root.render(
  render(
    <StrictMode>
      <AppLoader />
    </StrictMode>,
    container
  );
} else {
  document.body.innerHTML = 'Fatal error: Cannot find root container element.';
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
