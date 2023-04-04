import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { getNodeString, insertText, setNodes } from '@udecode/plate';
import {
  LiveQueryElement,
  TableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import { pluginStore, useNodePath } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { LiveConnectionResult, Spinner } from '@decipad/ui';
import { varNamify } from '@decipad/utils';
import { Result } from '@decipad/computer';
import { LiveQueryError } from './LiveQueryError';
import { useLiveQuery } from '../hooks/useLiveQuery';

export interface LiveConnectionCoreProps {
  element: LiveQueryElement;
  deleted: boolean;
}

export interface StoreResult {
  result?: Result.Result;
  error?: string;
}

const createStore = () => new WeakMap<LiveQueryElement, StoreResult>();

export const LiveQueryCore: FC<LiveConnectionCoreProps> = ({ element }) => {
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
        ></LiveConnectionResult>
      )}
      {persistedError ? (
        <LiveQueryError
          error={persistedError}
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
