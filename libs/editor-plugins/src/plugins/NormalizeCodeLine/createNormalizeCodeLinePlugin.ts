/* eslint-disable no-param-reassign */
// import { Computer } from '@decipad/computer';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_SMART_REF,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
// import { isFlagEnabled } from '@decipad/feature-flags';
import { getNodeChildren, isElement, unwrapNodes } from '@udecode/plate';
import { createNormalizerPlugin } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeCodeLine =
  (/* computer: Computer */) => (editor: MyEditor) => (entry: MyNodeEntry) => {
    const [node, path] = entry;

    assertElementType(node, ELEMENT_CODE_LINE);
    // Code line
    const children = Array.from(getNodeChildren(editor, path));
    for (const lineChild of children) {
      const [lineChildNode, lineChildPath] = lineChild;

      // Children must be text or SmartRef
      if (
        isElement(lineChildNode) &&
        lineChildNode.type !== ELEMENT_SMART_REF
      ) {
        unwrapNodes(editor, { at: lineChildPath });
        return true;
      }

      // add or extend smart refs
      // if (
      //   isFlagEnabled('EXPR_REFS') &&
      //   normalizeSmartRefs(lineChildNode, lineChildPath, editor, computer)
      // ) {
      //   return true;
      // }

      // Text must be plain
      if (
        !isElement(lineChildNode) &&
        normalizeExcessProperties(editor, lineChild)
      ) {
        return true;
      }
    }

    return false;
  };

export const createNormalizeCodeLinePlugin = (/* computer: Computer */) =>
  createNormalizerPlugin({
    name: 'NORMALIZE_CODE_LINE_PLUGIN',
    elementType: ELEMENT_CODE_LINE,
    plugin: normalizeCodeLine(/* computer */),
  });
