import { ELEMENT_SLIDER, MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { isElement, setNodes, unwrapNodes } from '@udecode/plate';

const normalize =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): boolean => {
    const [node, path] = entry;
    if (isElement(node) && node.type !== ELEMENT_SLIDER) {
      return false;
    }
    if (!isElement(node)) {
      unwrapNodes(editor, { at: path });
      return true;
    }

    if (typeof node.max !== 'string' || isNaN(Number(node.max))) {
      setNodes(editor, { max: '10' }, { at: path });
      return true;
    }

    if (typeof node.min !== 'string' || isNaN(Number(node.min))) {
      setNodes(editor, { min: '0' }, { at: path });
      return true;
    }

    if (typeof node.step !== 'string' || isNaN(Number(node.step))) {
      setNodes(editor, { step: '1' }, { at: path });
      return true;
    }

    if (typeof node.value !== 'string' || isNaN(Number(node.value))) {
      setNodes(editor, { value: '5' }, { at: path });
      return true;
    }

    return false;
  };

export const createNormalizeSliderPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_SLIDER_PLUGIN',
  elementType: ELEMENT_SLIDER,
  acceptableElementProperties: ['max', 'min', 'step', 'value'],
  plugin: normalize,
});
