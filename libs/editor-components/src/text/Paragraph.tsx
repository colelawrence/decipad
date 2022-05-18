import { PlateComponent, useTEditorState } from '@decipad/editor-types';
import { atoms } from '@decipad/ui';
import { isElementEmpty, isSelectionExpanded } from '@udecode/plate';
import { useReadOnly, useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';

export const Paragraph: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('Paragraph is not a leaf');
  }

  const editor = useTEditorState();
  const readOnly = useReadOnly();

  const selected = useSelected();

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="paragraph" element={element}>
        <atoms.Paragraph
          placeholder={
            isElementEmpty(editor, element) &&
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
