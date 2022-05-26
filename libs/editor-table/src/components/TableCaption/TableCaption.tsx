import { ELEMENT_TABLE_CAPTION, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { molecules } from '@decipad/ui';
import { getNodeString } from '@udecode/plate';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import { useTableColumnCount } from '../../hooks';

export const TableCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_TABLE_CAPTION);
  const columnCount = useTableColumnCount(element);

  return (
    <div {...attributes}>
      <molecules.EditableTableCaption
        isForWideTable={
          (columnCount && columnCount >= WIDE_MIN_COL_COUNT) || false
        }
        empty={getNodeString(element.children[0]).length === 0}
      >
        {children}
      </molecules.EditableTableCaption>
    </div>
  );
};
