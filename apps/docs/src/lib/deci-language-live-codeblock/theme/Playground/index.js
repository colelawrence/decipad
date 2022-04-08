/* eslint-disable import/no-extraneous-dependencies */
import React, { Fragment, useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Highlight, { Prism } from 'prism-react-renderer';
import { nanoid } from 'nanoid';
// eslint-disable-next-line import/no-unresolved
import useIsBrowser from '@docusaurus/useIsBrowser';
// eslint-disable-next-line import/no-unresolved
import usePrismTheme from '@theme/hooks/usePrismTheme';
import styles from './styles.module.css';

// global shenanigans
require('./pollute-global');

const { Computer, InferError } = require('@decipad/language');
const {
  CodeResult,
} = require('../../../../../../../libs/ui/src/organisms/CodeResult/CodeResult');

function identityFn(o) {
  return o;
}

function Preview({ result }) {
  if (!result) {
    return;
  }
  return (
    <div className={styles.playgroundPreview}>
      {result && <CodeResult type={result.type} value={result.value} />}
    </div>
  );
}

function LivePreviewOrError({ code: liveCode }) {
  const [blockId] = useState(nanoid);
  const [computer] = useState(() => new Computer());
  const [code, setCode] = useState(null);
  const [needsCompute, setNeedsCompute] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

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
    if (code && needsCompute) {
      try {
        setNeedsCompute(false);
        computer.pushCompute({
          program: [
            {
              type: 'unparsed-block',
              id: blockId,
              source: code,
            },
          ],
          subscriptions: [blockId],
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setError(err);
      }
    }
  }, [blockId, code, computer, needsCompute]);

  useEffect(() => {
    const subscription = computer.results.subscribe(({ blockResults }) => {
      const r = blockResults[blockId];
      if (!r) {
        return;
      }
      if (r.error) {
        setError(r.error.message);
        return;
      }
      const results = r.results.filter((res) => res.blockId === blockId);

      results.forEach((res) => {
        if (res.type === 'compute-panic') {
          setResult(null);
          setError(new Error(res.message));
        } else if (res.type.kind === 'type-error') {
          const inferError = new InferError(res.type.errorCause);
          setResult(null);
          setError(new Error(inferError.message));
        } else {
          setResult(res);
          setError(null);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [blockId, computer, result?.error?.message, result?.message]);

  return (
    <>
      <LiveError error={error} />
      {result && <Preview result={result} />}
    </>
  );
}

function LiveError({ error }) {
  if (error) {
    const message = error.message || error;
    return <pre className={styles.playgroundError}>{message}</pre>;
  }
  return null;
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
