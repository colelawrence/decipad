import {
  ELEMENT_H1,
  PlateComponent,
  useTEditorState,
} from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { molecules } from '@decipad/ui';
import {
  findNodePath,
  focusEditor,
  isElementEmpty,
  select,
} from '@udecode/plate';
import { useEffect, useState } from 'react';

// TODO Title should probably not be a part of the editor in the first place

export const Title: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_H1) {
    throw new Error('Title is not a leaf');
  }

  const editor = useTEditorState();
  const [shouldAutofocus, setShouldAutofocus] = useState(true);
  const readOnly = useIsEditorReadOnly();

  useEffect(() => {
    if (shouldAutofocus) {
      const path = findNodePath(editor, element.children[0]);
      if (path) {
        select(editor, {
          path,
          offset: 0,
        });
        focusEditor(editor);
        setShouldAutofocus(false);
      }
    }
  }, [editor, element, shouldAutofocus]);

  return (
    <div {...attributes} contentEditable={!readOnly}>
      <molecules.EditorTitle
        Heading="h1"
        placeholder={
          isElementEmpty(editor, element) ? 'My notebook title' : undefined
        }
      >
        {children}
      </molecules.EditorTitle>
    </div>
  );
};
