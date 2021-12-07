import { atoms } from '@decipad/ui';
import { PlatePluginComponent, useEditorState } from '@udecode/plate';
import { Editor } from 'slate';

// TODO Title should probably not be a part of the editor in the first place

export const Title: PlatePluginComponent = ({
  attributes,
  children,
  element,
}) => {
  const editor = useEditorState();

  if ('data-slate-leaf' in attributes) {
    throw new Error('Title is not a leaf');
  }

  return (
    <>
      <atoms.Display
        Heading="h1"
        placeholder={Editor.isEmpty(editor, element) ? 'Untitled' : undefined}
        slateAttrs={attributes}
      >
        {children}
      </atoms.Display>
      <div contentEditable={false} css={{ paddingBottom: '16px' }}>
        <atoms.Divider />
      </div>
    </>
  );
};
