import { getNodeEntry, useDndNode, withProviders } from '@udecode/plate';
import { Path } from 'slate';
import { molecules } from '@decipad/ui';
import {
  ELEMENT_TR,
  PlateComponent,
  TableElement,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { assertElementType, useNodePath } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { useEditorTableContext } from '@decipad/react-contexts';
import { useEffect, useRef } from 'react';
import { Provider, useAtom } from 'jotai';
import { useTableActions } from '../../hooks';
import { dropLineAtom, trScope } from '../../contexts/tableAtoms';
import { selectRow } from '../../utils/selectRow';
import { MAX_UNCOLLAPSED_TABLE_ROWS } from '../../constants';

const DRAG_ITEM_ROW = 'row';

export const TableRow: PlateComponent = withProviders([
  Provider,
  { scope: trScope },
])(({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TR);
  const editor = getDefined(useTPlateEditorRef());
  const path = getDefined(useNodePath(element));
  const { isCollapsed } = useEditorTableContext();
  const isVisible =
    !isCollapsed || path[path.length - 1] <= MAX_UNCOLLAPSED_TABLE_ROWS + 1;
  const tablePath = Path.parent(path);
  const [table] = getNodeEntry<TableElement>(editor, tablePath);
  const { onRemoveRow } = useTableActions(editor, table);

  const { id } = element;
  const trRef = useRef<HTMLTableRowElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { dragRef, dropLine, isDragging } = useDndNode({
    type: DRAG_ITEM_ROW,
    id,
    nodeRef: trRef,
    preview: {
      ref: previewRef,
    },
  });

  const [, setDropLine] = useAtom(dropLineAtom, trScope);

  useEffect(() => {
    setDropLine(dropLine);
  }, [dropLine, setDropLine]);

  const firstRow = path[path.length - 1] === 1;
  if (firstRow) {
    return (
      <molecules.TableHeaderRow attributes={attributes} readOnly={false}>
        {children}
      </molecules.TableHeaderRow>
    );
  }
  return (
    <molecules.TableRow
      attributes={attributes}
      readOnly={false}
      onRemove={() => onRemoveRow(element.id)}
      onSelect={() => selectRow(editor, path)}
      dragRef={dragRef}
      previewRef={previewRef}
      ref={trRef}
      isBeingDragged={isDragging}
      isVisible={isVisible}
    >
      {children}
    </molecules.TableRow>
  );
});
