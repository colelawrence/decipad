import {
  getNodeChildren,
  insertNodes,
  isElement,
  isText,
} from '@udecode/plate';
import { ELEMENT_INLINE_NUMBER } from '@decipad/editor-types';
import { createNormalizerPluginFactory } from '../../../pluginFactories';
import { isMagicNumber } from '../utils/isMagicNumber';

export const createNormalizeMagicNumbersPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_MAGIC_NUMBERS_PLUGIN',
  plugin:
    (editor) =>
    ([node, path]): boolean => {
      if (isElement(node)) {
        const children = Array.from(getNodeChildren(editor, path));
        if (children.length >= 1) {
          const [firstChild] = children[0];
          if (isText(firstChild) && isMagicNumber(firstChild)) {
            const insertAt = [...path, 0];
            insertNodes(
              editor,
              {
                text: ' ',
              },
              { at: insertAt }
            );
            return true;
          }

          const [lastChild] = children[children.length - 1];
          const isMagic = isText(lastChild) && isMagicNumber(lastChild);
          const isBubble = lastChild.type === ELEMENT_INLINE_NUMBER;

          if (isMagic || isBubble) {
            const insertAt = [...path, children.length];
            insertNodes(
              editor,
              {
                text: ' ',
              },
              { at: insertAt }
            );
            return true;
          }
        }
      }

      return false;
    },
});
