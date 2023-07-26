/* eslint-disable import/first */
/* eslint-disable import/no-relative-packages */
/* eslint-disable import/no-extraneous-dependencies */
import './pollute-global';
import { useState, useEffect, FC } from 'react';
import Editor from 'react-simple-code-editor';
import Highlight, { Prism } from 'prism-react-renderer';
import { identity } from '@decipad/utils';
// eslint-disable-next-line import/no-unresolved
import useIsBrowser from '@docusaurus/useIsBrowser';
// eslint-disable-next-line import/no-unresolved
import { usePrismTheme } from '@docusaurus/theme-common';
import {
  Result,
  createProgramFromMultipleStatements,
  IdentifiedResult,
  IdentifiedError,
  identifiedErrorToMessage,
} from '@decipad/computer';
import { useComputer, ComputerContextProvider } from '@decipad/react-contexts';
import { formatError } from '@decipad/format';
import { CodeResult } from '@decipad/ui/src/organisms/CodeResult/CodeResult';
import maxBy from 'lodash.maxby';
import styles from './styles.module.css';

interface PreviewProps {
  result: Result.Result;
}

const Preview: FC<PreviewProps> = ({ result }) => {
  if (!result) {
    return null;
  }
  return (
    <div className={styles.playgroundPreview}>
      {result && <CodeResult type={result.type} value={result.value} />}
    </div>
  );
};

export const getMaxIdObject = (
  objects: Readonly<IdentifiedError | IdentifiedResult>[]
): Readonly<IdentifiedError | IdentifiedResult> | undefined => {
  return maxBy(objects, (obj) => parseInt(obj.id.split('_')[0], 10));
};

interface LiveErrorProps {
  error?: Error | string | null;
}

const LiveError: FC<LiveErrorProps> = ({ error }) => {
  if (error) {
    const message = error instanceof Error ? error.message : error;
    return <pre className={styles.playgroundError}>{message}</pre>;
  }
  return null;
};

interface LivePreviewProps {
  code: string;
}

function LivePreviewOrError({ code: liveCode }: LivePreviewProps) {
  const computer = useComputer();
  const [code, setCode] = useState<string | null>(null);
  const [needsCompute, setNeedsCompute] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<Result.Result | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (code !== liveCode) {
      if (code == null) {
        setCode(liveCode);
        setNeedsCompute(true);
      } else {
        timeout = setTimeout(() => {
          setCode(liveCode);
          setNeedsCompute(true);
        }, 500);
      }
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [code, liveCode]);

  useEffect(() => {
    if (code && needsCompute) {
      try {
        setNeedsCompute(false);
        computer.pushCompute({
          program: createProgramFromMultipleStatements(code),
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setError(err as Error);
      }
    }
  }, [code, computer, needsCompute]);

  useEffect(() => {
    const subscription = computer.results.subscribe(({ blockResults }) => {
      const r = getMaxIdObject(Object.values(blockResults));
      if (!r) {
        return;
      }
      if (r.type === 'identified-error') {
        setResult(null);
        setError(new Error(identifiedErrorToMessage(r)));
      } else if (r.result.type.kind === 'type-error') {
        setResult(null);
        setError(new Error(formatError('en-US', r.result.type.errorCause)));
      } else {
        setResult(r.result);
        setError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [computer]);

  return (
    <>
      <LiveError error={error} />
      {result && <Preview result={result} />}
    </>
  );
}

interface ResultWithHeaderProps {
  code: string;
}

const ResultWithHeader: FC<ResultWithHeaderProps> = ({ code }) => {
  return (
    <>
      <div>
        <LivePreviewOrError code={code} />
      </div>
    </>
  );
};

interface EditorWithHeaderAndResultsProps {
  code: string;
  transformCode?: (s: string) => string;
}

const EditorWithHeaderAndResults: FC<EditorWithHeaderAndResultsProps> = ({
  code,
  transformCode = identity,
}) => {
  const [codeValue, setCodeValue] = useState(code);
  const prismTheme = usePrismTheme();

  const highlightCode = (c: string) => (
    <Highlight Prism={Prism} code={c} theme={prismTheme} language="markup">
      {({ tokens, getLineProps, getTokenProps }) =>
        tokens.map((line, i) => (
          // eslint-disable-next-line react/jsx-key
          <div {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              // eslint-disable-next-line react/jsx-key
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))
      }
    </Highlight>
  );

  return (
    <>
      <div className={styles.playgroundEditor}>
        <Editor
          value={codeValue}
          onValueChange={(c) => setCodeValue(transformCode(c))}
          highlight={highlightCode}
        />
      </div>
      <ResultWithHeader code={codeValue} />
      <span className={styles.playgroundFooter}>
        <span className={styles.playgroundMessage}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg
              width="12"
              height="13"
              viewBox="0 0 12 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.4283 0.526554C5.32921 0.561762 5.24389 0.639328 5.19395 0.739594L5.1502 0.827453V1.55638C5.1502 2.36888 5.15252 2.38844 5.26205 2.50128C5.29448 2.53471 5.35291 2.57911 5.39186 2.59994C5.46149 2.63717 5.47578 2.63799 6.22286 2.64629C6.96169 2.6545 6.9849 2.65577 7.05058 2.69128C7.13798 2.73856 7.2184 2.82324 7.25665 2.90828C7.28447 2.9701 7.2878 3.05905 7.29552 3.94778C7.30383 4.90321 7.30459 4.92083 7.34042 4.98729C7.38815 5.07579 7.45518 5.13786 7.5489 5.1803C7.62241 5.2136 7.65579 5.21475 8.56453 5.2151C9.581 5.21551 9.57911 5.21566 9.70021 5.12324C9.73107 5.09967 9.77847 5.04043 9.80551 4.99158L9.85469 4.90278V3.93088C9.85469 2.96595 9.85442 2.95849 9.81803 2.89048C9.77257 2.80552 9.69161 2.72498 9.61157 2.68509C9.55569 2.65726 9.46985 2.65403 8.57932 2.64629C8.04511 2.64164 7.59282 2.63085 7.57424 2.62232C7.48493 2.58128 7.39324 2.50244 7.3508 2.43024L7.30396 2.35049L7.29545 1.58988C7.28606 0.751239 7.28883 0.773061 7.17528 0.643655C7.14399 0.60799 7.08033 0.561086 7.0338 0.5394L6.94922 0.5L6.22286 0.501166C5.63744 0.502096 5.48327 0.507031 5.4283 0.526554ZM2.43711 2.6687C2.35733 2.69882 2.27138 2.76366 2.22874 2.82591C2.14501 2.94818 2.14492 2.94945 2.14413 3.93298C2.14332 4.93354 2.14322 4.93474 2.04957 5.05759C2.02622 5.08823 1.97126 5.13439 1.92744 5.16017L1.84777 5.20702L1.08762 5.21547C0.336088 5.22382 0.326577 5.22436 0.248316 5.26293C0.139378 5.31663 0.0557609 5.41435 0.0233785 5.52577C0.000523299 5.60443 -0.00261828 5.71996 0.00158788 6.32511C0.0063177 7.00219 0.0080406 7.03576 0.0419095 7.10856C0.0832279 7.19735 0.163584 7.28041 0.249633 7.32329C0.304972 7.35086 0.37798 7.35408 1.04369 7.35839C1.86759 7.36374 1.88477 7.36172 2.00369 7.24625C2.1378 7.11603 2.13391 7.14268 2.14339 6.28878C2.15161 5.54808 2.1528 5.52638 2.18862 5.45941C2.20884 5.42158 2.25591 5.36307 2.29319 5.32936C2.41804 5.2165 2.42832 5.21549 3.45983 5.2153L4.38161 5.21514L4.46607 5.17519C4.56757 5.12717 4.62965 5.06408 4.67585 4.96193C4.70915 4.88832 4.71028 4.85508 4.71063 3.92968L4.71101 2.9735L4.66455 2.88184C4.61278 2.77971 4.51012 2.69158 4.41075 2.66397C4.31794 2.63817 2.50647 2.64252 2.43711 2.6687ZM10.1069 5.69518C10.0598 5.71712 9.99726 5.76416 9.96798 5.79971C9.86535 5.9243 9.86313 5.94379 9.86313 6.72068C9.86313 7.30799 9.85886 7.43758 9.83746 7.49826C9.78234 7.6546 9.66622 7.75248 9.49924 7.78336C9.43708 7.79485 9.07692 7.8016 8.52132 7.80166C7.98343 7.80171 7.61804 7.80836 7.58061 7.81875C7.49898 7.84145 7.37425 7.95374 7.33072 8.04373C7.29633 8.1148 7.29551 8.13826 7.29562 9.06192C7.29567 9.64399 7.30224 10.0309 7.3127 10.0686C7.3353 10.15 7.45493 10.2835 7.53979 10.3221C7.60339 10.351 7.67328 10.3531 8.57088 10.3533L9.53374 10.3535L9.6194 10.3136C9.66651 10.2917 9.72943 10.2442 9.75925 10.2081C9.8619 10.0839 9.8631 10.0707 9.8635 9.0535C9.86386 8.16167 9.86501 8.12864 9.89834 8.0551C9.93944 7.9644 9.98337 7.91429 10.0743 7.85447L10.1419 7.81001L10.902 7.80156C11.6282 7.79348 11.6656 7.79154 11.7382 7.75775C11.8461 7.70755 11.9099 7.64844 11.9581 7.55401L12 7.47196V6.7198V5.96764L11.9498 5.87687C11.9221 5.82694 11.8761 5.76824 11.8475 5.7464C11.7274 5.65474 11.7293 5.65492 10.9321 5.65511L10.1925 5.65528L10.1069 5.69518ZM2.38317 7.84534C2.2756 7.89899 2.20112 7.9859 2.16824 8.09621C2.13148 8.21951 2.13148 9.9359 2.16824 10.0592C2.199 10.1624 2.27653 10.2585 2.36885 10.3079C2.43843 10.3451 2.44704 10.3455 3.4103 10.3538C4.2985 10.3616 4.38738 10.3649 4.44918 10.3927C4.52757 10.428 4.61308 10.5062 4.66567 10.5905C4.70181 10.6484 4.70273 10.665 4.71101 11.4103C4.71906 12.1364 4.72106 12.1743 4.75472 12.2471C4.79859 12.3419 4.88351 12.4284 4.97246 12.4688C5.0349 12.4972 5.09998 12.4997 5.77522 12.5C6.20948 12.5002 6.53466 12.4934 6.57025 12.4835C6.65736 12.4593 6.7703 12.355 6.81621 12.2563L6.85598 12.1709L6.85578 11.4356C6.85559 10.7319 6.8541 10.6971 6.82111 10.6243C6.78002 10.5336 6.73608 10.4835 6.64516 10.4237L6.5776 10.3792L5.8162 10.3707L5.05481 10.3623L4.95469 10.3112C4.83657 10.2509 4.75766 10.1473 4.72935 10.0152C4.71744 9.95965 4.71101 9.61188 4.71101 9.02379C4.71101 8.11938 4.71095 8.11784 4.67315 8.04214C4.62658 7.9488 4.50782 7.84154 4.42591 7.81875C4.38823 7.80829 4.00091 7.80171 3.41784 7.80166L2.47098 7.80156L2.38317 7.84534Z"
                fill="#AAB1BD"
              />
            </svg>
            <b>Decipad Language Sandbox</b>
          </span>
          Modify this example and see how it impacts the result
        </span>
      </span>
    </>
  );
};

interface PlaygroundProps {
  children: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const Playground: FC<PlaygroundProps> = ({ children, ...props }) => {
  const isBrowser = useIsBrowser();
  return (
    <div className={styles.playgroundContainer}>
      {isBrowser && (
        <ComputerContextProvider>
          <EditorWithHeaderAndResults
            code={isBrowser ? children.replace(/\n$/, '') : ''}
            {...props}
          />
        </ComputerContextProvider>
      )}
    </div>
  );
};

export default Playground;
