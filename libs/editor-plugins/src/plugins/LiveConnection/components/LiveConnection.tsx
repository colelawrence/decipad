import { Result } from '@decipad/computer';
import { BlockErrorBoundary, DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_LIVE_CONNECTION,
  LiveConnectionElement,
  PlateComponent,
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
import { useComputer } from '@decipad/react-contexts';
import { CodeError, LiveConnectionResult, Spinner } from '@decipad/ui';
import { varNamify } from '@decipad/utils';
import { getNodeString, insertText, setNodes } from '@udecode/plate';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

const MAX_CELL_COUNT = 3000;

interface LiveConnectionInnerProps {
  element: LiveConnectionElement;
  deleted: boolean;
}

interface StoreResult {
  result?: Result.Result;
  error?: Error;
}

const createStore = () => new WeakMap<LiveConnectionElement, StoreResult>();

const LiveConnectionInner: FC<LiveConnectionInnerProps> = ({
  element,
  deleted,
}) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION);
  const editor = useTEditorRef();
  const computer = useComputer();
  const path = useNodePath(element);

  const { error, result } = useLiveConnection(computer, {
    blockId: element.id,
    url: element.url,
    source: element.source,
    useFirstRowAsHeader: element.isFirstRowHeaderRow,
    columnTypeCoercions: element.columnTypeCoercions,
    maxCellCount: MAX_CELL_COUNT,
    deleted,
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

  return (
    <div contentEditable={false}>
      {persistedResult && (
        <LiveConnectionResult
          result={persistedResult}
          isFirstRowHeaderRow={element.isFirstRowHeaderRow}
          setIsFirstRowHeader={setIsFirstRowHeader}
          onChangeColumnType={onChangeColumnType}
        ></LiveConnectionResult>
      )}
      {persistedError ? (
        persistedError.message?.includes('Could not find the result') ? (
          <CodeError
            message={"We don't support importing this block type yet"}
            url={'/docs/'}
          />
        ) : (
          <CodeError
            message={
              persistedError?.message ||
              "There's an error in the source document"
            }
            defaultDocsMessage={'Go to source'}
            url={element.url || '/docs/'}
          />
        )
      ) : null}
      {!persistedError && !persistedResult && (
        <div>
          <Spinner />
        </div>
      )}
    </div>
  );
};

const LiveConnection: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION);
  const [deleted, setDeleted] = useState(false);
  const onceDeleted = useCallback(() => setDeleted(true), []);
  return (
    <DraggableBlock
      blockKind="editorTable"
      element={element}
      {...attributes}
      onceDeleted={onceDeleted}
    >
      <BlockErrorBoundary element={element}>
        {children}
        <LiveConnectionInner element={element} deleted={deleted} />
      </BlockErrorBoundary>
    </DraggableBlock>
  );
};

// use export default for React.lazy
export default LiveConnection;
