import { MyPlatePlugin } from '@decipad/editor-types';
import {
  BlockSelectionArea,
  BlockStartArea,
  createBlockSelectionPlugin as _createBlockSelectionPlugin,
} from '@udecode/plate-selection';
import { isElement, someNode } from '@udecode/plate';
import { nanoid } from 'nanoid';

export const createBlockSelectionPlugin = (): MyPlatePlugin =>
  _createBlockSelectionPlugin({
    withOverrides: (editor) => {
      const { apply } = editor;

      // eslint-disable-next-line no-param-reassign
      editor.apply = (op) => {
        if (op.type === 'insert_node') {
          // check only the root blocks
          if (op.path.length === 1) {
            const insertingId = op.node.id;
            const nodeWithId = someNode(editor, {
              at: [],
              match: (node) => isElement(node) && node.id === insertingId,
            });
            // eslint-disable-next-line no-param-reassign
            if (nodeWithId) op.node.id = nanoid();
          }
        }

        return apply(op);
      };

      return editor;
    },
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
