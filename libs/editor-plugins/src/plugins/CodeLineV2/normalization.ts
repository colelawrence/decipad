import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  MyGenericEditor,
} from '@decipad/editor-types';
import { isElementOfType, insertNodes } from '@decipad/editor-utils';
import type { RemoteComputer } from '@decipad/remote-computer';
import { nanoid } from 'nanoid';
import {
  EElementOrText,
  TEditor,
  TNodeProps,
  Value,
  getNodeChildren,
  removeNodes,
  setNodes,
} from '@udecode/plate';
import { normalizeCodeChildren } from '../NormalizeCodeLine/createNormalizeCodeLinePlugin';
import {
  NormalizerReturnValue,
  createNormalizerPlugin,
} from '../../pluginFactories';
import { normalizePlainTextChildren } from '../../utils/normalizePlainTextChildren';

export const createNormalizeCodeLineV2Plugin = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>() =>
  createNormalizerPlugin<TV, TE>({
    name: 'NORMALIZE_CODE_LINE_V2',
    elementType: ELEMENT_CODE_LINE_V2,
    acceptableSubElements: [
      ELEMENT_STRUCTURED_VARNAME,
      ELEMENT_CODE_LINE_V2_CODE,
    ],
    plugin:
      (editor) =>
      ([node, path]): NormalizerReturnValue => {
        if (isElementOfType(node, ELEMENT_CODE_LINE_V2)) {
          if (!node.children) {
            return () =>
              setNodes(
                editor,
                { children: [{ text: '' }] } as unknown as Partial<
                  TNodeProps<TEditor<TV>>
                >,
                { at: path }
              );
          }

          if (node.children.length < 1) {
            return () =>
              insertNodes(
                editor,
                [
                  {
                    type: ELEMENT_STRUCTURED_VARNAME,
                    id: nanoid(),
                    children: [{ text: '' }],
                  } as EElementOrText<TV>,
                ],
                { at: [...path, 0] }
              );
          }

          if (node.children[0].type !== ELEMENT_STRUCTURED_VARNAME) {
            return () => removeNodes(editor, { at: [...path, 0] });
          }

          if (node.children.length < 2) {
            return () =>
              insertNodes(
                editor,
                [
                  {
                    type: ELEMENT_CODE_LINE_V2_CODE,
                    id: nanoid(),
                    children: [{ text: '' }],
                  } as EElementOrText<TV>,
                ],
                { at: [...path, 1] }
              );
          }

          if (node.children[1].type !== ELEMENT_CODE_LINE_V2_CODE) {
            return () => removeNodes(editor, { at: [...path, 1] });
          }

          if (!isElementOfType(node.children[0], ELEMENT_STRUCTURED_VARNAME)) {
            return () => removeNodes(editor, { at: [...path, 0] });
          }

          if (!isElementOfType(node.children[1], ELEMENT_CODE_LINE_V2_CODE)) {
            return () => removeNodes(editor, { at: [...path, 1] });
          }

          if (node.children.length > 2) {
            return () => removeNodes(editor, { at: [...path, 2] });
          }
        }

        return false;
      },
  });

export const createNormalizeCodeLineCodePlugin = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>(
  computer: RemoteComputer
) =>
  createNormalizerPlugin<TV, TE>({
    name: 'NORMALIZE_CODE_LINE_V2_CODE',
    elementType: ELEMENT_CODE_LINE_V2_CODE,
    acceptableSubElements: [],
    plugin:
      (editor) =>
      (entry): NormalizerReturnValue => {
        if (isElementOfType(entry[0], ELEMENT_CODE_LINE_V2_CODE)) {
          return normalizeCodeChildren(computer, editor, entry);
        }
        return false;
      },
  });

export const createNormalizeCodeLineVarnamePlugin = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>() =>
  createNormalizerPlugin<TV, TE>({
    name: 'NORMALIZE_CODE_LINE_V2_VARNAME',
    elementType: ELEMENT_STRUCTURED_VARNAME,
    acceptableSubElements: [],
    plugin:
      (editor) =>
      (entry): NormalizerReturnValue => {
        if (isElementOfType(entry[0], ELEMENT_STRUCTURED_VARNAME)) {
          return normalizePlainTextChildren<TV, TE>(
            editor,
            getNodeChildren(editor, entry[1])
          );
        }

        return false;
      },
  });
