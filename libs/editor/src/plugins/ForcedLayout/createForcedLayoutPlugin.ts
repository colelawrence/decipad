/* eslint-disable no-param-reassign */
// TODO fix node types
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getNode,
  getPlatePluginWithOverrides,
  WithOverride,
} from '@udecode/plate';
import { Transforms } from 'slate';
import { ELEMENT_H1, ELEMENT_PARAGRAPH } from '../../elements';

export const WithForcedLayout = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const firstNode = getNode(editor, [0]);
      const secondNode = getNode(editor, [1]);

      // first node will always be an h1
      if (firstNode && (firstNode as any).type !== ELEMENT_H1) {
        const newNode = {
          ...firstNode,
          type: ELEMENT_H1,
        };
        Transforms.setNodes(editor, newNode, { at: [0] });
      }

      // if first node is an h1, change it to paragraph
      // this makes it possible for other types like blockquotes to also be the second node
      if (secondNode && (secondNode as any).type === ELEMENT_H1) {
        const newNode = {
          ...secondNode,
          type: ELEMENT_PARAGRAPH,
        };
        Transforms.setNodes(editor, newNode, { at: [1] });
      }
    }

    return normalizeNode([currentNode, currentPath]);
  };

  return editor;
};

export const createForcedLayoutPlugin =
  getPlatePluginWithOverrides(WithForcedLayout);
