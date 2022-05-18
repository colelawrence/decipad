import { ELEMENT_TABLE_CAPTION, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { molecules } from '@decipad/ui';
import { Node } from 'slate';

export const TableCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_TABLE_CAPTION);
  return (
    <div {...attributes}>
      <molecules.EditableTableCaption
        empty={Node.string(element.children[0]).length === 0}
      >
        {children}
      </molecules.EditableTableCaption>
    </div>
  );
};
