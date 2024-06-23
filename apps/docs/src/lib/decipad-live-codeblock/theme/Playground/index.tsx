import polluteGlobals from './pollute-global';
import { Suspense, lazy, type FC } from 'react';
// eslint-disable-next-line import/no-unresolved
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

polluteGlobals();

const EditorWithHeaderAndResults = lazy(
  () => import('./EditorWithHeaderAndResults')
);

interface PlaygroundProps {
  children: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const Playground: FC<PlaygroundProps> = ({ children, ...props }) => {
  return (
    <BrowserOnly>
      {() => (
        <Suspense fallback={<>Loading...</>}>
          <div className={styles.playgroundContainer}>
            <EditorWithHeaderAndResults
              code={children.replace(/\n$/, '')}
              {...props}
            />
          </div>
        </Suspense>
      )}
    </BrowserOnly>
  );
};

export default Playground;
