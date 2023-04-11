import { insertNodes } from '@decipad/editor-utils';
import { getNodeChildren, isElement, isText } from '@udecode/plate';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../../pluginFactories';
import { isMagicNumber } from '../utils/isMagicNumber';

export const createNormalizeMagicNumbersPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_MAGIC_NUMBERS_PLUGIN',
  plugin:
    (editor) =>
    ([node, path]): NormalizerReturnValue => {
      if (isElement(node)) {
        const children = Array.from(getNodeChildren(editor, path));
        if (children.length >= 1) {
          const [firstChild] = children[0];
          if (isText(firstChild) && isMagicNumber(firstChild)) {
            const insertAt = [...path, 0];
            return () =>
              insertNodes(
                editor,
                {
                  text: ' ',
                },
                { at: insertAt }
              );
          }

          const [lastChild] = children[children.length - 1];
          if (isText(lastChild) && isMagicNumber(lastChild)) {
            const insertAt = [...path, children.length];
            return () =>
              insertNodes(
                editor,
                {
                  text: ' ',
                },
                { at: insertAt }
              );
          }
        }
      }

      return false;
    },
});
