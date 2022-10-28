/* eslint-disable import/first */
/* eslint-disable import/no-relative-packages */
/* eslint-disable import/no-extraneous-dependencies */
import './pollute-global';
import { useState, useEffect, FC } from 'react';
import Editor from 'react-simple-code-editor';
import Highlight, { Prism } from 'prism-react-renderer';
import { identity } from 'ramda';
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
      const r: IdentifiedResult | IdentifiedError | undefined =
        Object.values(blockResults).pop();
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
    <Highlight Prism={Prism} code={c} theme={prismTheme} language="javascript">
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
