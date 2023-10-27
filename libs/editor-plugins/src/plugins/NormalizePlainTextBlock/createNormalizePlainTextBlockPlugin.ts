/* eslint-disable no-param-reassign */
import {
  ELEMENT_H1,
  MyEditor,
  MyNodeEntry,
  MyValue,
} from '@decipad/editor-types';
import { getNodeChildren, isElement } from '@udecode/plate';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';
import { normalizePlainTextChildren } from '../../utils/normalizePlainTextChildren';

const PLAIN_TEXT_BLOCK_TYPES = [ELEMENT_H1];

const normalizePlainTextBlock =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;

    if (isElement(node) && PLAIN_TEXT_BLOCK_TYPES.includes(node.type)) {
      {
        const normalize = normalizeExcessProperties(editor, entry);
        if (normalize) {
          return normalize;
        }
      }

      {
        const normalize = normalizePlainTextChildren<MyValue, MyEditor>(
          editor,
          getNodeChildren(editor, path)
        );
        if (normalize) {
          return normalize;
        }
      }
    }
    return false;
  };

export const createNormalizePlainTextBlockPlugin =
  createNormalizerPluginFactory({
    name: 'NORMALIZE_PLAIN_TEXT_BLOCK_PLUGIN',
    plugin: normalizePlainTextBlock,
  });
