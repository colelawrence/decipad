import { ELEMENT_POWER_TR, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { atoms } from '@decipad/ui';

export const PowerTableColumnHeaderRow: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_POWER_TR);
  return (
    <atoms.PowerTableColumnHeaderRow attributes={attributes}>
      {children}
    </atoms.PowerTableColumnHeaderRow>
  );
};
