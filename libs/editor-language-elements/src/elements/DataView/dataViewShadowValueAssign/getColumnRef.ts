import { DataViewHeader } from '@decipad/editor-types';
import { getExprRef } from '@decipad/remote-computer';

export const getColumnRef = (element: DataViewHeader) =>
  element.label ?? getExprRef(element.name);
