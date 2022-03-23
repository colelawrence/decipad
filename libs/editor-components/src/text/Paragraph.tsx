import { atoms } from '@decipad/ui';
import { isSelectionExpanded, useEditorState } from '@udecode/plate';
import { Editor } from 'slate';
import { useReadOnly, useSelected } from 'slate-react';
import { PlateComponent } from '@decipad/editor-types';
import { DraggableBlock } from '../block-management';

export const Paragraph: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('Paragraph is not a leaf');
  }

  const editor = useEditorState();
  const readOnly = useReadOnly();

  const selected = useSelected();

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
