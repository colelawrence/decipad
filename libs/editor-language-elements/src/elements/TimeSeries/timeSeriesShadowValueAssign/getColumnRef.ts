import { type TimeSeriesHeader } from '@decipad/editor-types';
import { getExprRef } from '@decipad/remote-computer';

export const getColumnRef = (element: TimeSeriesHeader) =>
  element.label ?? getExprRef(element.name ?? '');
