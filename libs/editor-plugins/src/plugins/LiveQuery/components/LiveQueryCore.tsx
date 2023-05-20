import { Result } from '@decipad/computer';
import {
  LiveQueryElement,
  TableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import { pluginStore } from '@decipad/editor-utils';
import { useNodePath } from '@decipad/editor-hooks';
import { useComputer } from '@decipad/react-contexts';
import { LiveConnectionResult, LiveError, Spinner } from '@decipad/ui';
import { varNamify } from '@decipad/utils';
import { getNodeString, insertText, setNodes } from '@udecode/plate';
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
  const computer = useComputer();
  const path = useNodePath(element);

  const { error, result, retry } = useLiveQuery({
    element,
  });

  const onChangeColumnType = useCallback(
    (columnIndex: number, type: TableCellType) => {
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

  // sync connection metadata title if needed
  useEffect(() => {
    if (path && result) {
      const caption = element.children[0];
      const currentTitle = getNodeString(caption);
      if (!currentTitle) {
        const newTitle = 'LiveConnection';
        insertText(
          editor,
          computer.getAvailableIdentifier(varNamify(newTitle), 1),
          { at: [...path, 0] }
        );
      }
    }
  }, [computer, editor, element.children, path, result]);

  // persist results

  const store = useMemo(
    () => pluginStore(editor, 'PLUGIN_LIVE_QUERY_COMPONENT', createStore),
    [editor]
  );

  const [, setVersion] = useState(0);

  useEffect(() => {
    const persistedResult = store.get(element);
    if (result && persistedResult?.result !== result) {
      store.set(element, { result, error });
      setVersion((v) => v + 1);
    } else if (error && persistedResult?.error !== error) {
      store.set(element, {
        result: undefined,
        error,
      });
      setVersion((v) => v + 1);
    }
  }, [element, error, result, store]);

  const { result: persistedResult = result, error: persistedError = error } =
    store.get(element) ?? {};

  const clearCacheAndRetry = useCallback(() => {
    store.set(element, { result: undefined, error: undefined });
    setVersion((v) => v + 1);
    retry();
  }, [element, retry, store]);

  return (
    <div contentEditable={false}>
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
      {!persistedError && !persistedResult && (
        <div>
          <Spinner />
        </div>
      )}
    </div>
  );
};
