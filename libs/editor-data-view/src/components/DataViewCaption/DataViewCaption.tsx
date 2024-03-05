import {
  ELEMENT_DATA_VIEW_CAPTION,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';

export const DataViewCaption: PlateComponent = ({
  element,
  attributes,
  children,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW_CAPTION);
  return <div {...attributes}>{children}</div>;
};
