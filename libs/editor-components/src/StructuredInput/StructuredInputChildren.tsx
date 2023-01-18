import {
  ELEMENT_STRUCTURED_IN_CHILD,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { findNodePath } from '@udecode/plate';

export const StructuredInputChildren: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_STRUCTURED_IN_CHILD);
  const editor = useTEditorRef();

  const path = findNodePath(editor, element);
  if (!path) return null;

  return (
    <span {...attributes} id={element.id}>
      {children}
    </span>
  );
};
