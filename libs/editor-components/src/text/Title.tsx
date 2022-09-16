import {
  ELEMENT_H1,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { EditorTitle } from '@decipad/ui';
import { findNodePath, focusEditor, isElementEmpty } from '@udecode/plate';
import { useEffect, useState } from 'react';

// TODO Title should probably not be a part of the editor in the first place

export const Title: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_H1) {
    throw new Error('Title is not a leaf');
  }

  const editor = useTEditorRef();
  const [shouldAutofocus, setShouldAutofocus] = useState(true);
  const readOnly = useIsEditorReadOnly();

  useEffect(() => {
    if (shouldAutofocus) {
      const path = findNodePath(editor, element.children[0]);
      if (path) {
        focusEditor(editor);
        setShouldAutofocus(false);
      }
    }
  }, [editor, element, shouldAutofocus]);

  return (
    <div {...attributes} contentEditable={readOnly ? false : undefined}>
      <EditorTitle
        Heading="h1"
        placeholder={
          isElementEmpty(editor, element) && !readOnly
            ? 'My notebook title'
            : undefined
        }
      >
        {children}
      </EditorTitle>
    </div>
  );
};
