import {
  BaseElement,
  ELEMENT_TABLE_CAPTION,
  PlateComponent,
} from '@decipad/editor-types';
import { molecules } from '@decipad/ui';
import { Node } from 'slate';

export const TableCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  if (!element || (element as BaseElement)?.type !== ELEMENT_TABLE_CAPTION) {
    throw new Error(
      `TableCell is meant to render table cells, not ${element?.type}`
    );
  }
  return (
    <caption {...attributes}>
      <molecules.EditableTableCaption empty={Node.string(element).length === 0}>
        {children}
      </molecules.EditableTableCaption>
    </caption>
  );
};
