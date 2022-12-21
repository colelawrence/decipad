/* eslint-disable no-param-reassign */
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { getNodeChildren, isElement } from '@udecode/plate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';
import { normalizePlainTextChildren } from '../../utils/normalizePlainTextChildren';

const PLAIN_TEXT_BLOCK_TYPES = [ELEMENT_H1, ELEMENT_H2, ELEMENT_H3];

const normalizePlainTextBlock = (editor: MyEditor) => (entry: MyNodeEntry) => {
  const [node, path] = entry;

  if (isElement(node) && PLAIN_TEXT_BLOCK_TYPES.includes(node.type)) {
    if (normalizeExcessProperties(editor, entry)) {
      return true;
    }

    if (normalizePlainTextChildren(editor, getNodeChildren(editor, path))) {
      return true;
    }
  }
  return false;
};

export const createNormalizePlainTextBlockPlugin =
  createNormalizerPluginFactory({
    name: 'NORMALIZE_PLAIN_TEXT_BLOCK_PLUGIN',
    plugin: normalizePlainTextBlock,
  });
