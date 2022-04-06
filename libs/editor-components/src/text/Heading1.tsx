import { atoms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { heading1 } from 'libs/ui/src/styles/block-alignment';
import { css } from '@emotion/react';
import { DraggableBlock } from '../block-management';

export const Heading1: PlateComponent = ({ attributes, children, element }) => {
  if (!element) {
    throw new Error('Heading1 is not a leaf');
  }

  return (
    <div
      {...attributes}
      css={css({
        width: `min(100%, ${heading1.desiredWidth}px)`,
        margin: 'auto',
      })}
    >
      <DraggableBlock blockKind="heading1" element={element}>
        <atoms.Heading1 Heading="h2">{children}</atoms.Heading1>
      </DraggableBlock>
    </div>
  );
};
