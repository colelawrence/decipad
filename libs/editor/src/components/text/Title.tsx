import { atoms } from '@decipad/ui';
import { useEditorState } from '@udecode/plate';
import { useEffect, useState } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { PlateComponent } from '../../types';
import { ELEMENT_H1 } from '../../elements';

// TODO Title should probably not be a part of the editor in the first place

export const Title: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_H1) {
    throw new Error('Title is not a leaf');
  }

  const editor = useEditorState();
  const [shouldAutofocus, setShouldAutofocus] = useState(true);

  useEffect(() => {
    if (shouldAutofocus) {
      Transforms.select(editor, {
        path: ReactEditor.findPath(editor, element.children[0]),
        offset: 0,
      });
      ReactEditor.focus(editor);
      setShouldAutofocus(false);
    }
  }, [editor, element, shouldAutofocus]);

  return (
    <div {...attributes}>
      <atoms.Display
        Heading="h1"
        placeholder={
          Editor.isEmpty(editor, element) ? 'My notebook title' : undefined
        }
      >
        {children}
      </atoms.Display>
      <div contentEditable={false} css={{ paddingBottom: '16px' }}>
        <atoms.Divider />
      </div>
    </div>
  );
};
