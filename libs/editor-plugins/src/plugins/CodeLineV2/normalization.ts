import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_CODE_LINE_V2_VARNAME,
  CodeLineV2ElementVarname,
  CodeLineV2ElementCode,
} from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { Computer } from '@decipad/computer';
import { nanoid } from 'nanoid';
import {
  getNodeChildren,
  insertNodes,
  removeNodes,
  setNodes,
} from '@udecode/plate';
import { normalizeCodeChildren } from '../NormalizeCodeLine/createNormalizeCodeLinePlugin';
import { createNormalizerPlugin } from '../../pluginFactories';
import { normalizePlainTextChildren } from '../../utils/normalizePlainTextChildren';

export const createNormalizeCodeLineV2Plugin = () =>
  createNormalizerPlugin({
    name: 'NORMALIZE_CODE_LINE_V2',
    elementType: ELEMENT_CODE_LINE_V2,
    acceptableSubElements: [
      ELEMENT_CODE_LINE_V2_VARNAME,
      ELEMENT_CODE_LINE_V2_CODE,
    ],
    plugin:
      (editor) =>
      ([node, path]) => {
        if (isElementOfType(node, ELEMENT_CODE_LINE_V2)) {
          if (!node.children) {
            setNodes(editor, { children: [{ text: '' }] }, { at: path });
            return true;
          }

          if (node.children.length < 1) {
            insertNodes(
              editor,
              {
                type: ELEMENT_CODE_LINE_V2_VARNAME,
                id: nanoid(),
                children: [{ text: '' }],
              } as CodeLineV2ElementVarname,
              { at: [...path, 0] }
            );

            return true;
          }

          if (node.children[0].type !== ELEMENT_CODE_LINE_V2_VARNAME) {
            removeNodes(editor, { at: [...path, 0] });

            return true;
          }

          if (node.children.length < 2) {
            insertNodes(
              editor,
              {
                type: ELEMENT_CODE_LINE_V2_CODE,
                id: nanoid(),
                children: [{ text: '' }],
              } as CodeLineV2ElementCode,
              { at: [...path, 1] }
            );

            return true;
          }

          if (node.children[1].type !== ELEMENT_CODE_LINE_V2_CODE) {
            removeNodes(editor, { at: [...path, 1] });

            return true;
          }

          if (
            !isElementOfType(node.children[0], ELEMENT_CODE_LINE_V2_VARNAME)
          ) {
            removeNodes(editor, { at: [...path, 0] });

            return true;
          }

          if (!isElementOfType(node.children[1], ELEMENT_CODE_LINE_V2_CODE)) {
            removeNodes(editor, { at: [...path, 1] });

            return true;
          }

          if (node.children.length > 2) {
            removeNodes(editor, { at: [...path, 2] });

            return true;
          }
        }

        return false;
      },
  });

export const createNormalizeCodeLineCodePlugin = (computer: Computer) =>
  createNormalizerPlugin({
    name: 'NORMALIZE_CODE_LINE_V2_CODE',
    elementType: ELEMENT_CODE_LINE_V2_CODE,
    acceptableSubElements: [],
    plugin: (editor) => (entry) => {
      if (isElementOfType(entry[0], ELEMENT_CODE_LINE_V2_CODE)) {
        return normalizeCodeChildren(computer, editor, entry);
      }
      return false;
    },
  });

export const createNormalizeCodeLineVarnamePlugin = () =>
  createNormalizerPlugin({
    name: 'NORMALIZE_CODE_LINE_V2_VARNAME',
    elementType: ELEMENT_CODE_LINE_V2_VARNAME,
    acceptableSubElements: [],
    plugin: (editor) => (entry) => {
      if (isElementOfType(entry[0], ELEMENT_CODE_LINE_V2_VARNAME)) {
        if (
          normalizePlainTextChildren(editor, getNodeChildren(editor, entry[1]))
        ) {
          return true;
        }
      }

      return false;
    },
  });
