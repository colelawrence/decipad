import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_TIME_SERIES_TR } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { DataViewColumnHeaderRow as UITimeSeriesColumnHeaderRow } from '@decipad/ui';

export const TimeSeriesColumnHeaderRow: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_TIME_SERIES_TR);

  return (
    <UITimeSeriesColumnHeaderRow attributes={attributes}>
      {children}
    </UITimeSeriesColumnHeaderRow>
  );
};
