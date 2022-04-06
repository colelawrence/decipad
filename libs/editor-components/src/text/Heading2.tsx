import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { heading2 } from 'libs/ui/src/styles/block-alignment';
import { DraggableBlock } from '../block-management';

export const Heading2: PlateComponent = ({ attributes, children, element }) => {
  if (!element) {
    throw new Error('Heading2 is not a leaf');
  }

  return (
    <div
      {...attributes}
      css={css({
        width: `min(100%, ${heading2.desiredWidth}px)`,
        margin: 'auto',
      })}
    >
      <DraggableBlock blockKind="heading2" element={element}>
        <atoms.Heading2 Heading="h3">{children}</atoms.Heading2>
      </DraggableBlock>
    </div>
  );
};
