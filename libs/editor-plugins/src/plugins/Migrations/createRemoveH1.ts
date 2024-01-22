import { ELEMENT_H1, MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { isElement, removeNodes } from '@udecode/plate-common';
import {
  createNormalizerPluginFactory,
  NormalizerReturnValue,
} from '../../pluginFactories';

export const createRemoveH1 = createNormalizerPluginFactory({
  name: 'MIGRATE_REMOVE_H1',
  elementType: ELEMENT_H1,
  plugin:
    (editor: MyEditor) =>
    (entry: MyNodeEntry): NormalizerReturnValue => {
      const [node, path] = entry;

      if (!isElement(node)) return false;
      if (node.type !== ELEMENT_H1) return false;

      return () => removeNodes(editor, { at: path });
    },
});
