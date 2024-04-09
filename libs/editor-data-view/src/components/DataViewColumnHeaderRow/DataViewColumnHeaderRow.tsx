import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_DATA_VIEW_TR } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { DataViewColumnHeaderRow as UIDataViewColumnHeaderRow } from '@decipad/ui';

export const DataViewColumnHeaderRow: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW_TR);

  return (
    <UIDataViewColumnHeaderRow attributes={attributes}>
      {children}
    </UIDataViewColumnHeaderRow>
  );
};
