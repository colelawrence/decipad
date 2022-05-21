import { someNode, TNode, TOperation } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { createOverrideApplyPluginFactory } from '../../pluginFactories';

export const createNewElementIdOnSplitPlugin = createOverrideApplyPluginFactory(
  {
    name: 'CREATE_NEW_ELEMENT_ID_ON_SPLIT_PLUGIN',
    plugin: (editor, apply) => (op: TOperation) => {
      if (op.type === 'split_node') {
        const node = op.properties as TNode;

        let { id } = node;

        if (
          id == null ||
          someNode(editor, {
            match: { id },
            at: [],
          })
        ) {
          id = nanoid();
        }

        return apply({
          ...op,
          properties: {
            ...op.properties,
            id,
          },
        });
      }
      return apply(op);
    },
  }
);
