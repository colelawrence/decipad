import {
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_TABLE,
  PlateComponent,
  TableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, getAboveNodeSafe } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { EditableTableCaption } from '@decipad/ui';
import {
  findNodePath,
  getNodeChild,
  getNodeString,
  isElement,
} from '@udecode/plate';
import { insertDataViewBelow } from 'libs/editor-components/src/utils/data-view';
import { useCallback } from 'react';

export const DataViewCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  const readOnly = useIsEditorReadOnly();

  assertElementType(element, ELEMENT_DATA_VIEW_CAPTION);
  const editor = useTEditorRef();
  const path = findNodePath(editor, element);
  const parent = getAboveNodeSafe<TableElement>(editor, {
    at: path,
    match: (node) => {
      return isElement(node) && node.type === ELEMENT_TABLE;
    },
  });

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

  return (
    <div {...attributes}>
      <EditableTableCaption
        readOnly={readOnly}
        empty={getNodeString(element.children[0]).length === 0}
        onAddDataViewButtonPress={onAddDataViewButtonPress}
        showToggleCollapsedButton={!!parent}
      >
        {children}
      </EditableTableCaption>
    </div>
  );
};
