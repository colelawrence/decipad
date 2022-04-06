import { atoms } from '@decipad/ui';
import { isSelectionExpanded, useEditorState } from '@udecode/plate';
import { Editor } from 'slate';
import { useReadOnly, useSelected } from 'slate-react';
import { PlateComponent } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { paragraph } from 'libs/ui/src/styles/block-alignment';
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
    <div
      {...attributes}
      css={css({
        width: `min(100%, ${paragraph.desiredWidth}px)`,
        margin: 'auto',
      })}
    >
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
