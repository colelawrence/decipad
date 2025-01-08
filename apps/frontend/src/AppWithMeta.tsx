import { LoadingLogo } from '@decipad/ui';
import { App } from './App';
import { Frame, initSentry, Providers } from './meta';

if (process.env.VITEST_WORKER_ID == null) {
  initSentry();
}

const AppWithMeta: React.FC = () => (
  <Providers>
    <Frame Heading="h1" title={null} suspenseFallback={<LoadingLogo />}>
      <App />
    </Frame>
  </Providers>
);
export default AppWithMeta;
