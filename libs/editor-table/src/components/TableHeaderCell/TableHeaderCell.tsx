import { useContext, useEffect, useMemo, useState } from 'react';
import {
  ColumnMenuDropdown,
  ELEMENT_TH,
  ELEMENT_VARIABLE_DEF,
  PlateComponent,
  TableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  EditorChangeContext,
  useComputer,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { TableColumnHeader, Tooltip } from '@decipad/ui';
import {
  assertElementType,
  useElementMutatorCallback,
  useEnsureValidVariableName,
  useNodePath,
} from '@decipad/editor-utils';
import { getNode, getNodeString } from '@udecode/plate';
import { Path } from 'slate';
import { useSelected } from 'slate-react';
import { concat, of } from 'rxjs';
import { dequal } from 'dequal';
import { selectColumn } from '../../utils/selectColumn';
import { useDragColumn } from '../../hooks/useDragColumn';
import {
  useColumnDropDirection,
  useDropColumn,
  useTableActions,
  useColumnInferredType,
} from '../../hooks';

export const TableHeaderCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_TH);
  const computer = useComputer();
  const editor = useTEditorRef();
  const path = useNodePath(element);
  const nThChild = path?.[path.length - 1];
  const tablePath = path && Path.parent(Path.parent(path));
  const table = tablePath && getNode<TableElement>(editor, tablePath);
  const { onChangeColumnType, onRemoveColumn } = useTableActions(editor, table);
  const focused = useSelected();
  const readOnly = useIsEditorReadOnly();

  const { dragSource, isDragging } = useDragColumn(editor, element);
  const [{ isOver }, dropTarget] = useDropColumn(editor, element);
  const dropDirection = useColumnDropDirection(editor, element);

  const parseUnit = useMemo(
    () => computer.getUnitFromText.bind(computer),
    [computer]
  );

  const editorChanges = useContext(EditorChangeContext);

  const [cols, setCols] = useState<ColumnMenuDropdown[]>([]);

  const mutateDropdownType = useElementMutatorCallback(
    editor,
    element,
    'cellType'
  );

  useEffect(() => {
    const editorChanges$ = concat(of(undefined), editorChanges);
    const sub = editorChanges$.subscribe(() => {
      const dropdowns = editor.children.filter(
        (c) => c.type === ELEMENT_VARIABLE_DEF && c.variant === 'dropdown'
      );
      const dropdownContent = dropdowns.map((d) => {
        assertElementType(d, ELEMENT_VARIABLE_DEF);
        return {
          id: d.id,
          value: d.children[0].children[0].text,
          type:
            d.coerceToType?.kind === 'string'
              ? ('string' as const)
              : ('number' as const),
        };
      });

      if (element.cellType.kind === 'dropdown') {
        const selectedDropdown = dropdownContent.find((d) => {
          if (element.cellType.kind === 'dropdown') {
            return element.cellType.id === d.id;
          }
          return undefined;
        });
        if (
          selectedDropdown?.type !== element.cellType.type &&
          selectedDropdown
        ) {
          mutateDropdownType({
            kind: 'dropdown',
            id: selectedDropdown.id,
            type: selectedDropdown.type,
          });
        }
      }

      if (!dequal(cols, dropdownContent)) {
        setCols(dropdownContent);
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [
    editor.children,
    editorChanges,
    element.cellType,
    mutateDropdownType,
    cols,
  ]);

  const { type: inferredType } = useColumnInferredType(element);

  const columnResult = computer.getBlockIdResult$.use(element.id);
  const errorMessage = useEnsureValidVariableName(
    element,
    [columnResult?.id],
    'Column'
  );

  return (
    <Tooltip
      trigger={
        <TableColumnHeader
          attributes={attributes}
          readOnly={readOnly}
          empty={getNodeString(element).length === 0}
          focused={focused}
          isFirst={nThChild === 0}
          onChangeColumnType={(newType) =>
            nThChild != null && onChangeColumnType(nThChild, newType)
          }
          onRemoveColumn={() => onRemoveColumn(element.id)}
          onSelectColumn={() => path && selectColumn(editor, path)}
          parseUnit={parseUnit}
          type={
            element.cellType?.kind === 'anything'
              ? inferredType
              : element.cellType
          }
          draggable={true}
          dragSource={dragSource}
          dropTarget={dropTarget}
          draggingOver={!isDragging && isOver}
          dropDirection={dropDirection}
          dropdownNames={cols}
        >
          {children}
        </TableColumnHeader>
      }
      open={errorMessage != null}
    >
      {errorMessage}
    </Tooltip>
  );
};
