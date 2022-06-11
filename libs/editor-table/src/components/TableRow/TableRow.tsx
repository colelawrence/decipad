import {
  findNodePath,
  getNodeEntry,
  useDndNode,
  withProviders,
} from '@udecode/plate';
import { Path } from 'slate';
import { molecules, useMergedRef } from '@decipad/ui';
import {
  ELEMENT_TR,
  PlateComponent,
  TableElement,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { useEffect, useRef } from 'react';
import { Provider, useAtom } from 'jotai';
import { useTableActions } from '../../hooks';
import { dropLineAtom, trScope } from '../../contexts/tableAtoms';

const DRAG_ITEM_ROW = 'row';

export const TableRow: PlateComponent = withProviders([
  Provider,
  { scope: trScope },
])(({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TR);
  const editor = getDefined(useTPlateEditorRef());
  const path = getDefined(findNodePath(editor, element));
  const tablePath = Path.parent(path);
  const [table] = getNodeEntry<TableElement>(editor, tablePath);
  const { onAddColumn, onRemoveRow } = useTableActions(editor, table);

  const { id } = element;
  const trRef = useRef<HTMLTableRowElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const {
    dragRef: dragSource,
    dropLine,
    isDragging,
  } = useDndNode({
    type: DRAG_ITEM_ROW,
    id,
    nodeRef: trRef,
    preview: {
      ref: previewRef,
    },
  });

  const dragRef = useMergedRef<HTMLDivElement>(previewRef, dragSource);

  const [, setDropLine] = useAtom(dropLineAtom, trScope);

  useEffect(() => {
    setDropLine(dropLine);
  }, [dropLine, setDropLine]);

  const firstRow = path[path.length - 1] === 1;
  if (firstRow) {
    return (
      <molecules.TableHeaderRow
        attributes={attributes}
        readOnly={false}
        actionsColumn={true}
        onAddColumn={onAddColumn}
      >
        {children}
      </molecules.TableHeaderRow>
    );
  }
  return (
    <molecules.TableRow
      attributes={attributes}
      readOnly={false}
      onRemove={() => onRemoveRow(element.id)}
      dragRef={dragRef}
      ref={trRef}
      isBeingDragged={isDragging}
    >
      {children}
    </molecules.TableRow>
  );
});
