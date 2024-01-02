/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useEffect, useCallback } from 'react';
import {
  ELEMENT_TD,
  ELEMENT_TH,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useCellType, useCellAnchor, useCellSelected } from '../../hooks';
import { useMemoPath } from '@decipad/react-utils';
import { findNodePath, getNodeString } from '@udecode/plate-common';
import { setCellText } from '../../utils/setCellText';
import { useTableCellWidth } from '../../hooks/useTableCellWidth';
import { useEditorTableContext } from '@decipad/react-contexts';
import { TableData, CellEditor } from '@decipad/ui';
import { changeColumnType } from '../../utils/changeColumnType';
import { last } from '@decipad/utils';
import { useFocused } from 'slate-react';
import { selectNextCell } from '../../utils/selectNextCell';

declare global {
  interface Window {
    tableCellRenderCount: number;
  }
}

const shouldCountRenders = isFlagEnabled('COUNT_TABLE_CELL_RENDERS');

if (shouldCountRenders) {
  window.tableCellRenderCount = 0;
}

export const TableCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (
    !isElementOfType(element, ELEMENT_TH) &&
    !isElementOfType(element, ELEMENT_TD)
  ) {
    throw new Error(
      `TableCell is meant to render table cells, not ${element?.type}`
    );
  }

  if (shouldCountRenders) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      window.tableCellRenderCount += 1;
    });
  }

  const editor = useTEditorRef();
  const anchor = useCellAnchor();
  const selected = useCellSelected();
  const focused = useFocused();
  const { tableFrozen } = useEditorTableContext();
  const cellType = useCellType(element);
  const path = useMemoPath(findNodePath(editor, element)!);
  const width = useTableCellWidth(element);
  const value = getNodeString(element);
  const [editing, setEditing] = useState(false); // Controlled by CellEditor
  const [cellEventTarget] = useState<EventTarget>(() => new EventTarget());

  const setValue = useCallback(
    (newValue: string) => setCellText(editor, path, newValue),
    [editor, path]
  );

  const convertToFormula = useCallback(() => {
    const tablePath = path.slice(0, 1);
    const columnIndex = last(path)!;
    changeColumnType(editor, tablePath, { kind: 'table-formula' }, columnIndex);
  }, [editor, path]);

  const selectNextCellCallback = useCallback(
    () => selectNextCell(editor, path),
    [editor, path]
  );

  // Pass keydown event to cell editor
  useEffect(() => {
    if (!focused || !anchor) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (editing) return;

      const cellEvent = new KeyboardEvent(event.type, event);
      cellEventTarget.dispatchEvent(cellEvent);
      if (cellEvent.defaultPrevented) event.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [anchor, focused, editing, cellEventTarget]);

  return (
    <TableData
      as="td"
      isUserContent
      isFormulaResult={cellType?.kind === 'table-formula'}
      attributes={attributes}
      anchor={anchor}
      selected={selected}
      editing={editing}
      onDoubleClick={(event) => {
        const cellEvent = new MouseEvent(event.type, event.nativeEvent);
        cellEventTarget.dispatchEvent(cellEvent);
        if (cellEvent.defaultPrevented) event.preventDefault();
      }}
    >
      <div contentEditable={false} css={width && { width }}>
        <CellEditor
          isTableFrozen={tableFrozen}
          type={cellType}
          value={value}
          eventTarget={cellEventTarget}
          onValueChange={setValue}
          onConvertToFormula={convertToFormula}
          onSelectNextCell={selectNextCellCallback}
          path={path}
          element={element}
          onEditingChange={setEditing}
        />
      </div>

      <span css={{ caretColor: 'transparent' }}>{children}</span>
    </TableData>
  );
};
