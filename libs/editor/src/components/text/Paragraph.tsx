import { atoms } from '@decipad/ui';
import { PlatePluginComponent, useEditorState } from '@udecode/plate';
import { Editor } from 'slate';

export const Paragraph: PlatePluginComponent = ({
  attributes,
  children,
  element,
}) => {
  const editor = useEditorState();

  if ('data-slate-leaf' in attributes) {
    throw new Error('Paragraph is not a leaf');
  }

  return (
    <atoms.Paragraph
      placeholder={
        Editor.isEmpty(editor, element)
          ? 'Type “/” for commands or write text'
          : undefined
      }
      slateAttrs={attributes}
    >
      {children}
    </atoms.Paragraph>
  );
};
