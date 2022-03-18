/* eslint-disable import/no-extraneous-dependencies */
import React, { Fragment, useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Highlight, { Prism } from 'prism-react-renderer';
import { nanoid } from 'nanoid';
import { BehaviorSubject } from 'rxjs';
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

const {
  useResults,
  ResultsContext,
  defaultResults,
} = require('../../../../../../../libs/react-contexts/src/index');

function identityFn(o) {
  return o;
}

function resultsContextFromComputerResult(blockId, result) {
  for (const update of result.updates) {
    if (update.blockId === blockId) {
      let error = update.error && update.error.message;
      if (!error) {
        const resultWithError = update.results.find(
          (res) => res.type.errorCause != null
        );
        if (resultWithError) {
          error = new InferError(resultWithError.type.errorCause).message;
        }
      }
      const lastResult = update.results[update.results.length - 1];
      return [
        error,
        {
          blockResults: {
            [blockId]: {
              isSyntaxError: update.isSyntaxError,
              results: [lastResult],
            },
          },
          indexLabels: result.indexLabels,
        },
      ];
    }
  }
}

function Preview({ blockId }) {
  const { blockResults } = useResults();
  const block = blockResults[blockId];
  return (
    <div className={styles.playgroundPreview}>
      {block?.results[0] && (
        <CodeResult
          type={block.results[0].type}
          value={block.results[0].value}
        />
      )}
    </div>
  );
}

function LivePreviewOrError({ code: liveCode }) {
  const [blockId] = useState(nanoid);
  const [computer] = useState(() => new Computer());
  const [resultsContext] = useState(() => new BehaviorSubject(defaultResults));
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
            resultsContext.next(contextValue);
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
  }, [blockId, code, computer, needsCompute, resultsContext]);

  return (
    <ResultsContext.Provider value={resultsContext}>
      <LiveError error={error} />
      <Preview blockId={blockId} />
    </ResultsContext.Provider>
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
