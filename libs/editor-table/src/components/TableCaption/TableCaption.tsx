import {
  insertDataViewBelow,
  insertPlotBelow,
} from '@decipad/editor-components';
import { useEnsureValidVariableName } from '@decipad/editor-hooks';
import type { PlateComponent, TableElement } from '@decipad/editor-types';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType, getAboveNodeSafe } from '@decipad/editor-utils';
import { useComputer, useIsEditorReadOnly } from '@decipad/react-contexts';
import { getExprRef } from '@decipad/remote-computer';
import type { MarkType } from '@decipad/ui';
import { EditableTableCaption, Tooltip } from '@decipad/ui';
import {
  findNodePath,
  getNodeChild,
  getNodeString,
  isElement,
} from '@udecode/plate-common';
import { useCallback } from 'react';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import { useTableColumnCount } from '../../hooks';

export const TableCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  const readOnly = useIsEditorReadOnly();
  const computer = useComputer();

  assertElementType(element, ELEMENT_TABLE_CAPTION);
  const columnCount = useTableColumnCount(element);
  const editor = useMyEditorRef();
  const path = findNodePath(editor, element);
  const parent = getAboveNodeSafe<TableElement>(editor, {
    at: path,
    match: (node) => {
      return isElement(node) && node.type === ELEMENT_TABLE;
    },
  });

  const tableBlockId = parent?.[0].id;
  const firstThId = parent?.[0].children?.[1]?.children?.[0].id;

  // ensure name is unique
  const varNameElement = element.children[0];
  const tooltip = useEnsureValidVariableName(varNameElement, [
    tableBlockId,
    firstThId,
  ]);

  const onAddDataViewButtonPress = useCallback(() => {
    if (!parent) {
      return;
    }

    const [tableElement, parentPath] = parent;

    return (
      path &&
      insertDataViewBelow(
        editor,
        parentPath,
        computer,
        tableElement.id,
        getNodeString(getNodeChild(element, 0))
      )
    );
  }, [computer, editor, element, parent, path]);

  const onAddChartViewButtonPress = useCallback(
    (markType: MarkType) => {
      if (!parent) {
        return;
      }

      const [tableElement, parentPath] = parent;

      return (
        path &&
        insertPlotBelow(
          editor,
          parentPath,
          markType,
          getExprRef(tableElement.id)
        )
      );
    },
    [editor, parent, path]
  );

  const caption = (
    <div {...attributes}>
      <EditableTableCaption
        readOnly={readOnly}
        isForWideTable={
          (columnCount && columnCount >= WIDE_MIN_COL_COUNT) || false
        }
        empty={getNodeString(element.children[0]).length === 0}
        onAddDataViewButtonPress={onAddDataViewButtonPress}
        onAddChartViewButtonPress={onAddChartViewButtonPress}
      >
        {children}
      </EditableTableCaption>
    </div>
  );

  return tooltip ? (
    <Tooltip side="left" hoverOnly open trigger={caption}>
      {tooltip}
    </Tooltip>
  ) : (
    caption
  );
};
