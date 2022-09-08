import { FC, useCallback, useEffect } from 'react';
import { getNodeString, insertText, setNodes } from '@udecode/plate';
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
import { atoms, molecules, organisms } from '@decipad/ui';
import { useLiveConnection } from '@decipad/live-connect';
import { useComputer } from '@decipad/react-contexts';
import { DraggableBlock, BlockErrorBoundary } from '@decipad/editor-components';
import { varNamify } from '@decipad/utils';

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
        <organisms.CodeResult
          type={computerResult.type}
          value={computerResult.value}
          variant="block"
          isLiveResult
          firstTableRowControls={
            <molecules.ImportTableRowControls
              isFirstRow={!element.isFirstRowHeaderRow}
              toggleFirstRowIsHeader={setIsFirstRowHeader}
            />
          }
          onChangeColumnType={onChangeColumnType}
        ></organisms.CodeResult>
      )}
      {error && <atoms.CodeError message={error.message} url="/docs" />}
      {!error && !result && <atoms.Spinner />}
    </div>
  );
};

const LiveConnection: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_LIVE_CONNECTION);

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="editorTable" element={element}>
        <BlockErrorBoundary element={element}>
          {children}
          <LiveConnectionInner element={element} />
        </BlockErrorBoundary>
      </DraggableBlock>
    </div>
  );
};

// use export default for React.lazy
export default LiveConnection;
