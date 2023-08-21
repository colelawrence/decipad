import { Suspense } from 'react';
import { GlobalStyles, LoadingLogo } from '@decipad/ui';
import { lazyLoad } from '@decipad/react-utils';

const AppWithMeta = lazyLoad(
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
