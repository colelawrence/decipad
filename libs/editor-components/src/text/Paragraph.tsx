import { PlateComponent, useTEditorState } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { atoms } from '@decipad/ui';
import { isElementEmpty, isSelectionExpanded } from '@udecode/plate';
import { useSelected } from 'slate-react';
import { DraggableBlock } from '../block-management';

const PLACEHOLDER_TEXT = 'Type “/” for commands or write text';

export const Paragraph: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('Paragraph is not a leaf');
  }

  const readOnly = useIsEditorReadOnly();
  const editor = useTEditorState();

  const selected = useSelected();

  // If notebook is empty, we display the placeholder, even if not selected.
  const needPlaceholder =
    !readOnly &&
    ((editor.children.length === 2 && isElementEmpty(editor, element)) ||
      (isElementEmpty(editor, element) &&
        selected &&
        !isSelectionExpanded(editor)));

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="paragraph" element={element}>
        <atoms.Paragraph
          placeholder={needPlaceholder ? PLACEHOLDER_TEXT : undefined}
        >
          {children}
        </atoms.Paragraph>
      </DraggableBlock>
    </div>
  );
};
