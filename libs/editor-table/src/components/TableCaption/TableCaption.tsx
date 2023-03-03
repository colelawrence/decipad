import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  PlateComponent,
  TableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  getAboveNodeSafe,
  useEnsureValidVariableName,
} from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { EditableTableCaption, Tooltip } from '@decipad/ui';
import {
  findNodePath,
  getNodeChild,
  getNodeString,
  isElement,
} from '@udecode/plate';
import { insertDataViewBelow } from 'libs/editor-components/src/utils/data-view';
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

  // ensure name is unique
  const varNameElement = element.children[0];
  const tooltip = useEnsureValidVariableName(varNameElement, parent?.[0].id);

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

  const caption = (
    <div {...attributes}>
      <EditableTableCaption
        readOnly={readOnly}
        isForWideTable={
          (columnCount && columnCount >= WIDE_MIN_COL_COUNT) || false
        }
        empty={getNodeString(element.children[0]).length === 0}
        onAddDataViewButtonPress={onAddDataViewButtonPress}
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
