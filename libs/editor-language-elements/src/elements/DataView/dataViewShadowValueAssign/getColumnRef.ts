import { TimeSeriesHeader, type DataViewHeader } from '@decipad/editor-types';
import { getExprRef } from '@decipad/remote-computer';

export const getColumnRef = (element: DataViewHeader | TimeSeriesHeader) =>
  element.label ?? getExprRef(element.name ?? '');
