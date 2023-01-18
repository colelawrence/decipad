import { Computer } from '@decipad/computer';
import {
  StructuredInput,
  StructuredInputChildren,
} from '@decipad/editor-components';
import {
  ELEMENT_STRUCTURED_IN,
  ELEMENT_STRUCTURED_IN_CHILD,
  MyElement,
  MyPlatePlugin,
} from '@decipad/editor-types';
import { insertStructuredInput } from '@decipad/editor-utils';
import { getEndPoint, getNode } from '@udecode/plate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { setSelection } from '../NormalizeCodeBlock/utils';

export const createStructuredInputPlugin = (
  getAvailableIdentifier: Computer['getAvailableIdentifier']
): MyPlatePlugin => ({
  key: ELEMENT_STRUCTURED_IN,
  isElement: true,
  isVoid: false,
  component: StructuredInput,
  plugins: [
    {
      key: ELEMENT_STRUCTURED_IN_CHILD,
      isElement: true,
      component: StructuredInputChildren,
    },
    createOnKeyDownPluginFactory({
      name: 'STRUCTURED_INPUT_KEYBOARD',
      plugin:
        (editor) =>
        (event): boolean | void => {
          const { selection } = editor;
          if (!selection) return false;
          const path = [...selection.anchor.path];

          const oldPath = selection.anchor.path;
          const name = oldPath.at(1) === 0;

          const node = getNode(editor, [oldPath[0]]) as MyElement;
          if (node.type !== ELEMENT_STRUCTURED_IN || !node) return;

          if (
            (event.key === 'Tab' && !event.shiftKey) ||
            (event.key === 'ArrowRight' &&
              node.children[oldPath[1]].children[0].text.length ===
                selection.anchor.offset) ||
            event.key === 'ArrowDown'
          ) {
            event.preventDefault();
            event.stopPropagation();
            const nextNode = getNode(editor, [path[0] + 1]);
            if (name) {
              path[1] = 1;
              setSelection(editor, {
                anchor: {
                  offset: 0,
                  path,
                },
                focus: getEndPoint(editor, path),
              });
            } else if (
              nextNode &&
              (nextNode as MyElement).type === ELEMENT_STRUCTURED_IN
            ) {
              path[0] += 1;
              path[1] = 0;
              setSelection(editor, {
                anchor: {
                  offset: 0,
                  path,
                },
                focus: getEndPoint(editor, path),
              });
            }
          } else if (
            (event.key === 'Tab' && event.shiftKey) ||
            event.key === 'ArrowUp'
          ) {
            event.preventDefault();
            event.stopPropagation();
            const prevNode = getNode(editor, [path[0] - 1]) as MyElement;
            if (!name) {
              path[1] = 0;
              setSelection(editor, {
                anchor: {
                  offset: 0,
                  path,
                },
                focus: getEndPoint(editor, path),
              });
            } else if (prevNode && prevNode.type === ELEMENT_STRUCTURED_IN) {
              path[0] -= 1;
              path[1] = 1;
              setSelection(editor, {
                anchor: {
                  offset: 0,
                  path,
                },
                focus: getEndPoint(editor, path),
              });
            }
          } else if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            insertStructuredInput(editor, [path[0]], getAvailableIdentifier);
          }
        },
    })(),
  ],
});
