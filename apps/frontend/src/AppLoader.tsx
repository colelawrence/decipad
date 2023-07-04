import { lazy, Suspense } from 'react';
import { GlobalStyles, LoadingLogo } from '@decipad/ui';

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

export default AppLoader;
