import {
  ELEMENT_STRUCTURED_IN,
  ELEMENT_STRUCTURED_IN_CHILD,
  ELEMENT_STRUCTURED_VARNAME,
  MyEditor,
  MyNodeEntry,
  StructuredInputElementChildren,
  StructuredVarnameElement,
} from '@decipad/editor-types';
import {
  getNodeString,
  insertText,
  isElement,
  nanoid,
  removeNodes,
  unwrapNodes,
} from '@udecode/plate';
import { insertNodes } from '@decipad/editor-utils';
import { Computer } from '@decipad/computer';
import { createNormalizerPluginFactory } from '../../pluginFactories';

export const createNormalizeStructuredInput = (
  getAvailableIdentifier: Computer['getAvailableIdentifier']
) =>
  createNormalizerPluginFactory({
    name: 'NORMALIZE_STRUCTURED_INPUT',
    elementType: ELEMENT_STRUCTURED_IN,
    plugin:
      (editor: MyEditor) =>
      (entry: MyNodeEntry): boolean => {
        const [node, path] = entry;
        if (isElement(node) && node.type !== ELEMENT_STRUCTURED_IN) {
          return false;
        }

        if (!isElement(node)) {
          unwrapNodes(editor, { at: path });
          return true;
        }

        if (node.children.length > 2) {
          removeNodes(editor, { at: [...path, node.children.length - 1] });
          return true;
        }

        if (node.children.length < 1) {
          insertNodes<StructuredVarnameElement>(
            editor,
            {
              id: nanoid(),
              type: ELEMENT_STRUCTURED_VARNAME,
              children: [{ text: '' }],
              options: [],
            },
            { at: [...path, 0] }
          );
          return true;
        }

        if (node.children.length < 2) {
          insertNodes<StructuredInputElementChildren>(
            editor,
            {
              id: nanoid(),
              type: ELEMENT_STRUCTURED_IN_CHILD,
              children: [{ text: getAvailableIdentifier('Name', 1) }],
              options: [],
            },
            { at: [...path, 0] }
          );
          return true;
        }

        const [, value] = node.children;

        // Only numbers should be allowed
        const text = getNodeString(value).replaceAll(/[^0-9.-]/g, '');
        if (text !== getNodeString(value)) {
          insertText(editor, text, { at: [...path, 1] });
          return true;
        }

        // Then check for - and . (Both characters only being allowed once)
        const lastIndexDash = text.lastIndexOf('-');
        if (lastIndexDash > 0) {
          insertText(
            editor,
            text.substring(0, lastIndexDash) +
              text.substring(lastIndexDash + 1),
            { at: [...path, 1] }
          );
          return true;
        }

        // There can only be 1 `.` in the number
        const lastIndexDot = text.lastIndexOf('.');
        if (text.lastIndexOf('.') !== text.indexOf('.')) {
          insertText(
            editor,
            text.substring(0, lastIndexDot) + text.substring(lastIndexDot + 1),
            { at: [...path, 1] }
          );
          return true;
        }

        return false;
      },
  })();
