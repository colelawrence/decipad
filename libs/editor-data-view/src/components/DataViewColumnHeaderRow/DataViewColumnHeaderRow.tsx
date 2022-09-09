import { ELEMENT_DATA_VIEW_TR, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { atoms } from '@decipad/ui';

export const DataViewColumnHeaderRow: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW_TR);

  return (
    <atoms.DataViewColumnHeaderRow attributes={attributes}>
      {children}
    </atoms.DataViewColumnHeaderRow>
  );
};
