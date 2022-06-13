import { App } from './App';
import { Frame, initSentry, Providers } from './meta';

initSentry();

const AppWithMeta: React.FC = () => (
  <Providers>
    <Frame Heading="h1" title="Decipad — Make sense of numbers">
      <App />
    </Frame>
  </Providers>
);
export default AppWithMeta;
