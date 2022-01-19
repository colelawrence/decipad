import { atoms } from '@decipad/ui';
import { useEditorState } from '@udecode/plate';
import { Editor } from 'slate';
import { PlateComponent } from '../../utils/components';

// TODO Title should probably not be a part of the editor in the first place

export const Title: PlateComponent = ({ attributes, children, element }) => {
  const editor = useEditorState();

  if (!element) {
    throw new Error('Title is not a leaf');
  }

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
