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

const { Computer } = require('@decipad/language');
const {
  Result,
} = require('../../../../../../../libs/ui/src/lib/Editor/Blocks/Result/Result.component');

const {
  ResultsContextProvider,
  makeResultsContextValue,
} = require('../../../../../../../libs/ui/src/lib/Contexts/Results');

function identityFn(o) {
  return o;
}

function resultsContextFromComputerResult(blockId, result) {
  for (const update of result.updates) {
    if (update.blockId === blockId) {
      let error = update.isSyntaxError ? new TypeError(update.error) : null;
      if (update.results.length > 0 && update.results[0].valueType.errorCause) {
        error = update.results[0].valueType.errorCause;
        update.results = [];
      }
      return [
        error,
        {
          blockResults: {
            [blockId]: {
              isSyntaxError: update.isSyntaxError,
              results: update.results,
            },
          },
          indexLabels: result.indexLabels,
        },
      ];
    }
  }
}

function Preview({ blockId }) {
  return (
    <div className={styles.playgroundPreview}>
      <Result blockId={blockId} useDefaultStyles={false} />
    </div>
  );
}

function LivePreviewOrError({ code: liveCode }) {
  const [blockId] = useState(nanoid);
  const [computer] = useState(() => new Computer());
  const [resultsContext, setResultsContext] = useState(makeResultsContextValue);
  const [code, setCode] = useState(null);
  const [needsCompute, setNeedsCompute] = useState(false);
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
          const result = await computer.compute({
            program: [
              {
                type: 'unparsed-block',
                id: blockId,
                source: code,
              },
            ],
            subscriptions: [blockId],
          });
          if (result.type === 'compute-panic') {
            setError(new Error(result.message));
            return;
          }
          const [computerError, contextValue] =
            resultsContextFromComputerResult(blockId, result);
          if (computerError) {
            setError(computerError);
          } else {
            setError(null);
          }
          if (contextValue) {
            setResultsContext(contextValue);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          setError(err);
        }
      }
    })();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [blockId, code, needsCompute, resultsContext]);

  return (
    <ResultsContextProvider value={resultsContext}>
      <LiveError error={error} />
      <Preview blockId={blockId} />
    </ResultsContextProvider>
  );
}

function LiveError({ error }) {
  if (error) {
    let message = error.message || error;
    if (message.length > 100) {
      message = `${message.substring(0, 100)}…`;
    }
    return <div className={styles.playgroundError}>{message}</div>;
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
