import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { blockquote } from 'libs/ui/src/styles/block-alignment';
import { css } from '@emotion/react';
import { DraggableBlock } from '../block-management';

export const Blockquote: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('Blockquote is not a leaf');
  }

  return (
    <div
      {...attributes}
      css={css({
        width: `min(100%, ${blockquote.desiredWidth}px)`,
        margin: 'auto',
      })}
    >
      <DraggableBlock blockKind="blockquote" element={element}>
        <atoms.Blockquote>{children}</atoms.Blockquote>
      </DraggableBlock>
    </div>
  );
};
