import { MyPlatePlugin } from '@decipad/editor-types';
import {
  BlockSelectionArea,
  BlockStartArea,
  createBlockSelectionPlugin as _createBlockSelectionPlugin,
} from '@udecode/plate-selection';

export const createBlockSelectionPlugin = (): MyPlatePlugin =>
  _createBlockSelectionPlugin({
    renderAboveEditable: ({ children }) => (
      <BlockSelectionArea getBoundaries={() => ['html']}>
        <BlockStartArea
          placement="left"
          size="50vw"
          style={{
            top: -104,
            zIndex: 0,
          }}
        />
        <BlockStartArea
          placement="right"
          size="50vw"
          style={{
            top: -104,
            zIndex: 0,
          }}
        />
        {children}
      </BlockSelectionArea>
    ),
    inject: {
      // BlockSelectable is rendered below DraggableBlock
      aboveComponent: null,
    },
  });
