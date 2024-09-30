import type { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { ELEMENT_SLIDER } from '@decipad/editor-types';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import { createNormalizerPluginFactory } from '@decipad/editor-plugin-factories';
import { isElement, setNodes, unwrapNodes } from '@udecode/plate-common';

const normalizeSlider =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;
    if (isElement(node) && node.type !== ELEMENT_SLIDER) {
      return false;
    }
    if (!isElement(node)) {
      return () => unwrapNodes(editor, { at: path });
    }
    if (typeof node.max !== 'string' || isNaN(Number(node.max))) {
      return () => setNodes(editor, { max: '10' }, { at: path });
    }

    if (typeof node.min !== 'string' || isNaN(Number(node.min))) {
      return () => setNodes(editor, { min: '0' }, { at: path });
    }

    if (typeof node.step !== 'string' || isNaN(Number(node.step))) {
      return () => setNodes(editor, { step: '1' }, { at: path });
    }

    return false;
  };

export const createNormalizeSliderPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_SLIDER_PLUGIN',
  elementType: ELEMENT_SLIDER,
  acceptableElementProperties: ['max', 'min', 'step'],
  plugin: normalizeSlider,
});
