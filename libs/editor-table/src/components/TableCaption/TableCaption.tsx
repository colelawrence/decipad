import { getExprRef } from '@decipad/computer';
import {
  insertDataViewBelow,
  insertPlotBelow,
} from '@decipad/editor-components';
import { useEnsureValidVariableName } from '@decipad/editor-hooks';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  PlateComponent,
  TableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, getAboveNodeSafe } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { EditableTableCaption, Tooltip } from '@decipad/ui';
import {
  findNodePath,
  getNodeChild,
  getNodeString,
  isElement,
} from '@udecode/plate';
import { MarkType } from 'libs/ui/src/organisms/PlotParams/PlotParams';
import { useCallback } from 'react';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import { useTableColumnCount } from '../../hooks';

export const TableCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  const readOnly = useIsEditorReadOnly();

  assertElementType(element, ELEMENT_TABLE_CAPTION);
  const columnCount = useTableColumnCount(element);
  const editor = useTEditorRef();
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
        tableElement.id,
        getNodeString(getNodeChild(element, 0))
      )
    );
  }, [editor, element, parent, path]);

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
        showToggleCollapsedButton={!!parent}
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
