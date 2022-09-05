import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  PlateComponent,
  TableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { molecules } from '@decipad/ui';
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
  const computer = useComputer();

  const onAddDataViewButtonPress = (e: Event) => {
    const path = findNodePath(editor, element);
    const parent = getAboveNode<TableElement>(editor, {
      at: path,
      match: (node) => {
        return isElement(node) && node.type === ELEMENT_TABLE;
      },
    });

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
        computer.getAvailableIdentifier.bind(computer),
        getNodeString(getNodeChild(element, 0))
      )
    );
  };

  return (
    <div {...attributes}>
      <molecules.EditableTableCaption
        isForWideTable={
          (columnCount && columnCount >= WIDE_MIN_COL_COUNT) || false
        }
        empty={getNodeString(element.children[0]).length === 0}
        onAddDataViewButtonPress={(e) => onAddDataViewButtonPress(e)}
      >
        {children}
      </molecules.EditableTableCaption>
    </div>
  );
};
