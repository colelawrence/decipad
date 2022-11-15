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
  useElementMutatorCallback,
  useNodePath,
} from '@decipad/editor-utils';
import { useLiveConnection } from '@decipad/live-connect';
import { useComputer } from '@decipad/react-contexts';
import { CodeError, LiveConnectionResult, Spinner } from '@decipad/ui';
import { varNamify } from '@decipad/utils';
import { getNodeString, insertText, setNodes } from '@udecode/plate';
import { FC, useCallback, useEffect } from 'react';

const MAX_CELL_COUNT = 3000;

interface LiveConnectionInnerProps {
  element: LiveConnectionElement;
}

const LiveConnectionInner: FC<LiveConnectionInnerProps> = ({ element }) => {
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

  const computerResult = result?.result;

  return (
    <div contentEditable={false}>
      {computerResult && (
        <LiveConnectionResult
          result={computerResult}
          isFirstRowHeaderRow={element.isFirstRowHeaderRow}
          setIsFirstRowHeader={setIsFirstRowHeader}
          onChangeColumnType={onChangeColumnType}
        ></LiveConnectionResult>
      )}
      {error ? (
        error.message?.includes('Could not find the result') ? (
          <CodeError
            message={"We don't support importing this block type yet"}
            url={'/docs/'}
          />
        ) : (
          <CodeError
            message={
              error?.message || "There's an error in the source document"
            }
            defaultDocsMessage={'Go to source'}
            url={element.url || '/docs/'}
          />
        )
      ) : null}
      {!error && !result && (
        <div>
          <Spinner />
        </div>
      )}
    </div>
  );
};

const LiveConnection: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION);

  return (
    <DraggableBlock blockKind="editorTable" element={element} {...attributes}>
      <BlockErrorBoundary element={element}>
        {children}
        <LiveConnectionInner element={element} />
      </BlockErrorBoundary>
    </DraggableBlock>
  );
};

// use export default for React.lazy
export default LiveConnection;
