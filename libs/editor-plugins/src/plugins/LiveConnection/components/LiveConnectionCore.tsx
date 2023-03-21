import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { getNodeString, insertText, setNodes } from '@udecode/plate';
import {
  ELEMENT_LIVE_CONNECTION,
  LiveConnectionElement,
  TableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  pluginStore,
  useElementMutatorCallback,
  useNodePath,
} from '@decipad/editor-utils';
import { useLiveConnection } from '@decipad/live-connect';
import {
  useComputer,
  ExternalDataSourceContext,
} from '@decipad/react-contexts';
import { LiveConnectionResult, Spinner } from '@decipad/ui';
import { varNamify } from '@decipad/utils';
import { Result } from '@decipad/computer';
import { ExternalDataSource } from '@decipad/interfaces';
import { LiveConnectionError } from './LiveConnectionError';

const MAX_CELL_COUNT = 3000;

export interface LiveConnectionCoreProps {
  element: LiveConnectionElement;
  deleted: boolean;
}

export interface StoreResult {
  result?: Result.Result;
  error?: Error;
}

const createStore = () => new WeakMap<LiveConnectionElement, StoreResult>();

export const LiveConnectionCore: FC<LiveConnectionCoreProps> = ({
  element,
  deleted,
}) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION);
  const editor = useTEditorRef();
  const computer = useComputer();
  const path = useNodePath(element);

  const beforeAuthenticate = useCallback(
    async (source: ExternalDataSource) => {
      if (path) {
        setNodes(editor, { proxy: source.dataUrl }, { at: path });
      }
    },
    [editor, path]
  );

  const { error, result, retry, authenticate } = useLiveConnection(computer, {
    blockId: element.id,
    url: element.url,
    proxy: element.proxy,
    source: element.source,
    useFirstRowAsHeader: element.isFirstRowHeaderRow,
    columnTypeCoercions: element.columnTypeCoercions,
    maxCellCount: MAX_CELL_COUNT,
    deleted,
    beforeAuthenticate,
    externalDataSourceContext: ExternalDataSourceContext,
  });

  const onChangeColumnType = useCallback(
    (columnIndex: number, type: TableCellType) => {
      if (path) {
        setNodes<LiveConnectionElement>(
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

  const setIsFirstRowHeader = useElementMutatorCallback(
    editor,
    element,
    'isFirstRowHeaderRow'
  );

  // sync connection metadata title if needed
  useEffect(() => {
    if (path && result) {
      const caption = element.children[0];
      const currentTitle = getNodeString(caption);
      if (!currentTitle) {
        const newTitle = result.meta?.title || 'LiveConnection';
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
    () => pluginStore(editor, 'PLUGIN_LIVE_CONNECTION_COMPONENT', createStore),
    [editor]
  );

  const [, setVersion] = useState(0);

  useEffect(() => {
    const persistedResult = store.get(element);
    if (result && persistedResult?.result !== result.result) {
      store.set(element, { result: result.result, error: undefined });
      setVersion((v) => v + 1);
    } else if (error && persistedResult?.error !== error) {
      store.set(element, { result: undefined, error });
      setVersion((v) => v + 1);
    }
  }, [element, error, result, store]);

  const {
    result: persistedResult = result?.result,
    error: persistedError = error,
  } = store.get(element) ?? {};

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
          isFirstRowHeaderRow={element.isFirstRowHeaderRow}
          setIsFirstRowHeader={setIsFirstRowHeader}
          onChangeColumnType={onChangeColumnType}
          element={element}
        ></LiveConnectionResult>
      )}
      {persistedError ? (
        <LiveConnectionError
          error={persistedError}
          errorURL={element.url || '/docs/'}
          onRetry={clearCacheAndRetry}
          onAuthenticate={authenticate}
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
