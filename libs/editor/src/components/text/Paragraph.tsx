import { atoms } from '@decipad/ui';
import { useEditorState, isSelectionExpanded } from '@udecode/plate';
import { Editor } from 'slate';
import { useSelected } from 'slate-react';
import { PlateComponent } from '../../types';

export const Paragraph: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  const editor = useEditorState();
  const selected = useSelected();

  if (!element) {
    throw new Error('Paragraph is not a leaf');
  }

  return (
    <div {...attributes}>
      <atoms.Paragraph
        placeholder={
          Editor.isEmpty(editor, element) &&
          selected &&
          !isSelectionExpanded(editor)
            ? 'Type “/” for commands or write text'
            : undefined
        }
      >
        {children}
      </atoms.Paragraph>
    </div>
  );
};
