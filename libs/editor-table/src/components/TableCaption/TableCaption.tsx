import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  PlateComponent,
  TableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { EditableTableCaption } from '@decipad/ui';
import {
  findNodePath,
  getAboveNode,
  getNodeChild,
  getNodeString,
  isElement,
} from '@udecode/plate';
import { insertDataViewBelow } from 'libs/editor-components/src/utils/data-view';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import { useTableColumnCount } from '../../hooks';

export const TableCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_TABLE_CAPTION);
  const columnCount = useTableColumnCount(element);
  const editor = useTEditorRef();
  const path = findNodePath(editor, element);
  const parent = getAboveNode<TableElement>(editor, {
    at: path,
    match: (node) => {
      return isElement(node) && node.type === ELEMENT_TABLE;
    },
  });

  const onAddDataViewButtonPress = (e: Event) => {
    if (!parent) {
      return;
    }

    const [, parentPath] = parent;

    e.preventDefault();

    return (
      path &&
      insertDataViewBelow(
        editor,
        parentPath,
        getNodeString(getNodeChild(element, 0))
      )
    );
  };

  return (
    <div {...attributes}>
      <EditableTableCaption
        isForWideTable={
          (columnCount && columnCount >= WIDE_MIN_COL_COUNT) || false
        }
        empty={getNodeString(element.children[0]).length === 0}
        onAddDataViewButtonPress={(e) => onAddDataViewButtonPress(e)}
        showToggleCollapsedButton={!!parent}
      >
        {children}
      </EditableTableCaption>
    </div>
  );
};
