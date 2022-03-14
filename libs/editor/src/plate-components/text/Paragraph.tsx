import { types } from '@decipad/editor-config';
import { atoms } from '@decipad/ui';
import { isSelectionExpanded, useEditorState } from '@udecode/plate';
import { Editor } from 'slate';
import { useReadOnly, useSelected } from 'slate-react';
import { DraggableBlock } from '../../components';

export const Paragraph: types.PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  const editor = useEditorState();
  const selected = useSelected();
  const readOnly = useReadOnly();

  if (!element) {
    throw new Error('Paragraph is not a leaf');
  }

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="paragraph" element={element}>
        <atoms.Paragraph
          placeholder={
            Editor.isEmpty(editor, element) &&
            selected &&
            !isSelectionExpanded(editor) &&
            !readOnly
              ? 'Type “/” for commands or write text'
              : undefined
          }
        >
          {children}
        </atoms.Paragraph>
      </DraggableBlock>
    </div>
  );
};
