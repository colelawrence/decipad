/* eslint-disable no-param-reassign */
import {
  ELEMENT_CODE_LINE,
  ELEMENT_SMART_REF,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { getNodeChildren, isElement, unwrapNodes } from '@udecode/plate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeCodeLine = (editor: MyEditor) => (entry: MyNodeEntry) => {
  const [node, path] = entry;

  assertElementType(node, ELEMENT_CODE_LINE);
  // Code line
  for (const lineChild of getNodeChildren(editor, path)) {
    const [lineChildNode, lineChildPath] = lineChild;

    // Children must be text or SmartRef
    if (isElement(lineChildNode)) {
      if (lineChildNode.type !== ELEMENT_SMART_REF) {
        unwrapNodes(editor, { at: lineChildPath });
      }
      return true;
    }

    // Text must be plain
    if (normalizeExcessProperties(editor, lineChild)) {
      return true;
    }
  }

  return false;
};

export const createNormalizeCodeLinePlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_CODE_LINE_PLUGIN',
  elementType: ELEMENT_CODE_LINE,
  plugin: normalizeCodeLine,
});
