import { PlateComponent } from '@decipad/editor-types';
import { atoms } from '@decipad/ui';
import { isSelectionExpanded, useEditorState } from '@udecode/plate';
import { RefObject } from 'react';
import { Editor } from 'slate';
import { useReadOnly, useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';

export const Paragraph: PlateComponent<{
  paragraphRef?: RefObject<HTMLParagraphElement>;
}> = ({ attributes, children, element, paragraphRef }) => {
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
          paragraphRef={paragraphRef}
        >
          {children}
        </atoms.Paragraph>
      </DraggableBlock>
    </div>
  );
};
