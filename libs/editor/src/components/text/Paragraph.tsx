import { atoms } from '@decipad/ui';
import {
  PlatePluginComponent,
  useEditorState,
  isSelectionExpanded,
} from '@udecode/plate';
import { Editor } from 'slate';
import { useSelected } from 'slate-react';

export const Paragraph: PlatePluginComponent = ({
  attributes,
  children,
  element,
}) => {
  const editor = useEditorState();
  const selected = useSelected();

  if ('data-slate-leaf' in attributes) {
    throw new Error('Paragraph is not a leaf');
  }

  return (
    <atoms.Paragraph
      placeholder={
        Editor.isEmpty(editor, element) &&
        selected &&
        !isSelectionExpanded(editor)
          ? 'Type “/” for commands or write text'
          : undefined
      }
      slateAttrs={attributes}
    >
      {children}
    </atoms.Paragraph>
  );
};
