import { molecules } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { list } from 'libs/ui/src/styles/block-alignment';
import { DraggableBlock } from '../block-management';

export const OrderedList: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('UnorderedList is not a leaf');
  }

  return (
    <div
      {...attributes}
      css={css({
        width: `min(100%, ${list.desiredWidth}px)`,
        margin: 'auto',
      })}
    >
      <DraggableBlock blockKind="list" element={element}>
        <molecules.OrderedList>{children}</molecules.OrderedList>
      </DraggableBlock>
    </div>
  );
};
