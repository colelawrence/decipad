import { Result } from '@decipad/computer';
import { useNodePath } from '@decipad/editor-hooks';
import {
  LiveQueryElement,
  TableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import { pluginStore } from '@decipad/editor-utils';
import { Button, LiveConnectionResult, LiveError, Spinner } from '@decipad/ui';
import { setNodes } from '@udecode/plate';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from '../hooks/useLiveQuery';

export interface LiveConnectionCoreProps {
  element: LiveQueryElement;
  deleted: boolean;
  showLiveQueryResults?: boolean;
}

export interface StoreResult {
  result?: Result.Result;
  error?: string;
}

const createStore = () => new WeakMap<LiveQueryElement, StoreResult>();

export const LiveQueryCore: FC<LiveConnectionCoreProps> = ({
  element,
  showLiveQueryResults = false,
}) => {
  const editor = useTEditorRef();
  const path = useNodePath(element);

  const liveQuery = useLiveQuery({
    element,
  });
  const { runQuery, status } = liveQuery;

  const onChangeColumnType = useCallback(
    (columnIndex: number, type?: TableCellType) => {
      if (path) {
        setNodes<LiveQueryElement>(
          editor,
          {
            columnTypeCoercions: {
              ...element.columnTypeCoercions,
              [columnIndex]: type,
            },
          },
          { at: path }
        );
      }
    },
    [editor, element.columnTypeCoercions, path]
  );

  // persist results

  const store = useMemo(
    () => pluginStore(editor, 'PLUGIN_LIVE_QUERY_COMPONENT', createStore),
    [editor]
  );

  const [, setVersion] = useState(0);

  useEffect(() => {
    const { error, result } = liveQuery;
    if (!error && !result) {
      return;
    }
    const persistedResult = store.get(element);
    if (status === 'success' && persistedResult?.result !== result) {
      store.set(element, { result, error: undefined });
      setVersion((v) => v + 1);
    } else if (status === 'error' && persistedResult?.error !== error) {
      store.set(element, {
        result: undefined,
        error,
      });
      setVersion((v) => v + 1);
    }
  }, [element, liveQuery, status, store]);

  const {
    result: persistedResult = liveQuery.status === 'success'
      ? liveQuery.result
      : undefined,
    error: persistedError = liveQuery.status === 'error'
      ? liveQuery.error
      : undefined,
  } = store.get(element) ?? {};

  const clearCacheAndRetry = useCallback(() => {
    store.set(element, { result: undefined, error: undefined });
    setVersion((v) => v + 1);
    runQuery();
  }, [element, runQuery, store]);

  return (
    <div contentEditable={false}>
      <Button onClick={runQuery}>Run Query</Button>
      {persistedResult && (
        <LiveConnectionResult
          result={persistedResult}
          onChangeColumnType={onChangeColumnType}
          element={element}
          showLiveQueryResults={showLiveQueryResults}
        ></LiveConnectionResult>
      )}
      {persistedError ? (
        <LiveError
          error={new Error(persistedError)}
          errorURL={'/docs/'}
          onRetry={clearCacheAndRetry}
        />
      ) : null}
      {status === 'loading' && (
        <div>
          <Spinner />
        </div>
      )}
    </div>
  );
};
