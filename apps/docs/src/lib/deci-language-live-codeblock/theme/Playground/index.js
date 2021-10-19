import React, { Fragment, useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Highlight, { Prism } from 'prism-react-renderer';
// eslint-disable-next-line import/no-unresolved
import useIsBrowser from '@docusaurus/useIsBrowser';
// eslint-disable-next-line import/no-unresolved
import usePrismTheme from '@theme/hooks/usePrismTheme';
import styles from './styles.module.css';

// global shenanigans
require('./pollute-global');

const { runCode } = require('@decipad/language');
const {
  ResultContent,
} = require('../../../../../../../libs/ui/src/lib/Editor/Blocks/Result/Result.component');

function identityFn(o) {
  return o;
}

function Preview({ result }) {
  return (
    <div className={styles.playgroundPreview}>
      <ResultContent {...result} />
    </div>
  );
}

function LivePreviewOrError({ code: liveCode }) {
  const [code, setCode] = useState(null);
  const [needsCompute, setNeedsCompute] = useState(false);
  const [result, setResult] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeout;
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
    let timeout;
    (async () => {
      if (code && needsCompute) {
        try {
          setNeedsCompute(false);
          setResult(await runCode(code));
          setError(null);
        } catch (err) {
          if (result == null) {
            setError(err);
          } else {
            timeout = setTimeout(() => {
              setError(err);
            }, 2000);
          }
        }
      }
    })();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [code, needsCompute, result]);

  if (error) {
    return <LiveError error={error} />;
  }
  return <Preview result={result} />;
}

function LiveError({ error }) {
  return <div className={styles.playgroundError}>{error.message || error}</div>;
}

function ResultWithHeader({ code }) {
  return (
    <>
      <div>
        <LivePreviewOrError code={code} />
      </div>
    </>
  );
}

function EditorWithHeaderAndResuts({ code, transformCode = identityFn }) {
  const [codeValue, setCodeValue] = useState(code);
  const prismTheme = usePrismTheme();

  const highlightCode = (c) => (
    <Highlight Prism={Prism} code={c} theme={prismTheme} language="js">
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
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Playground({ children, ...props }) {
  const isBrowser = useIsBrowser();
  return (
    <div className={styles.playgroundContainer}>
      {isBrowser && (
        <EditorWithHeaderAndResuts
          code={isBrowser ? children.replace(/\n$/, '') : ''}
          {...props}
        />
      )}
    </div>
  );
}
