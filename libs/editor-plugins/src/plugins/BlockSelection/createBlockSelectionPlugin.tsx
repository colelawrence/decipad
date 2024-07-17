import type { MyPlatePlugin } from '@decipad/editor-types';
import {
  BlockSelectionArea,
  BlockStartArea,
  createBlockSelectionPlugin as _createBlockSelectionPlugin,
} from '@udecode/plate-selection';
import { ReactNode } from 'react';

export const createBlockSelectionPlugin = (): MyPlatePlugin =>
  _createBlockSelectionPlugin({
    renderAboveEditable: ({ children }: { children: ReactNode }) => (
      <BlockSelectionArea getBoundaries={() => ['#overflowing-editor']}>
        <BlockStartArea
          state={{
            placement: 'left',
            size: '50vw',
          }}
          className="top-[-104px] z-1"
        />
        <BlockStartArea
          state={{
            placement: 'right',
            size: '50vw',
          }}
          className="top-[-104px] z-1"
        />
        {children}
      </BlockSelectionArea>
    ),
    inject: {
      // BlockSelectable is rendered below DraggableBlock
      aboveComponent: null,
    },
  });
