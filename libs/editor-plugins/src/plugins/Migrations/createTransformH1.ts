import type { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { ELEMENT_H1, ELEMENT_H2 } from '@decipad/editor-types';
import { isElement, setNodes } from '@udecode/plate-common';
import type { NormalizerReturnValue } from '../../pluginFactories';
import { createNormalizerPluginFactory } from '../../pluginFactories';

export const createTransformH1 = createNormalizerPluginFactory({
  name: 'MIGRATE_H1_TO_H2',
  elementType: ELEMENT_H1,
  plugin:
    (editor: MyEditor) =>
    (entry: MyNodeEntry): NormalizerReturnValue => {
      const [node, path] = entry;

      if (!isElement(node)) return false;
      if (node.type !== ELEMENT_H1) return false;

      return () => setNodes(editor, { type: ELEMENT_H2 }, { at: path });
    },
});
