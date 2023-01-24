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
import {
  getEndPoint,
  getNode,
  getNodeString,
  getStartPoint,
} from '@udecode/plate';
import { KeyboardEvent } from 'react';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { setSelection } from '../NormalizeCodeBlock/utils';
import { createNormalizeStructuredInput } from './createNormalizeStructuredInput';

type Shortcuts =
  | 'move-right'
  | 'move-left'
  | 'move-up'
  | 'move-down'
  | 'new-element';

// In the future this function could be used by all elements to get shortcuts.
function getShortcut(event: KeyboardEvent): Shortcuts | undefined {
  switch (true) {
    case (event.key === 'Tab' || event.key === 'Enter') && !event.shiftKey:
      return 'move-right';
    case event.key === 'Tab' && event.shiftKey:
      return 'move-left';
    case event.key === 'ArrowUp':
      return 'move-up';
    case event.key === 'ArrowDown':
      return 'move-down';
    case event.key === 'Enter' && event.shiftKey:
      return 'new-element';
  }
  return undefined;
}

function getAlignedOffset(
  offset: number,
  text: string,
  nextText: string,
  aligned: 'left' | 'right'
): number {
  if (aligned === 'left') {
    return offset > nextText.length ? nextText.length : offset;
  }
  return text.length - offset > nextText.length
    ? 0
    : nextText.length - (text.length - offset);
}

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
    onStructuredInputKeyDownPlugin(getAvailableIdentifier),
    createNormalizeStructuredInput(getAvailableIdentifier),
  ],
});

export function onStructuredInputKeyDownPlugin(
  getAvailableIdentifier: Computer['getAvailableIdentifier']
) {
  return createOnKeyDownPluginFactory({
    name: 'STRUCTURED_INPUT_KEYBOARD',
    plugin:
      (editor) =>
      (event): boolean => {
        const { selection } = editor;
        if (!selection) return false;
        const anchor = { ...selection.anchor };

        const node = getNode<MyElement>(editor, [anchor.path[0]]);
        if (!node || node.type !== ELEMENT_STRUCTURED_IN) return false;
        const shortcut = getShortcut(event);
        const nodeText = getNodeString(node.children[anchor.path[1]]);

        if (shortcut === 'move-right' || shortcut === 'move-left') {
          event.preventDefault();
          event.stopPropagation();

          // Selection is on the var name, so we have a next node.
          if (
            (anchor.path[1] === 0 && shortcut === 'move-right') ||
            (anchor.path[1] === 1 && shortcut === 'move-left')
          ) {
            anchor.path[1] = shortcut === 'move-right' ? 1 : 0;
            setSelection(editor, {
              anchor: getStartPoint(editor, anchor.path),
              focus: getEndPoint(editor, anchor.path),
            });

            return true;
          }

          const c = shortcut === 'move-right' ? 1 : -1;
          // Else, we are on the value, and must check if we can move downwards
          const nextNode = getNode<MyElement>(editor, [anchor.path[0] + c]);
          if (nextNode && nextNode.type === ELEMENT_STRUCTURED_IN) {
            anchor.path[0] += c;
            anchor.path[1] = shortcut === 'move-right' ? 0 : 1;
            setSelection(editor, {
              anchor: getStartPoint(editor, anchor.path),
              focus: getEndPoint(editor, anchor.path),
            });
          }
        } else if (shortcut === 'move-up' || shortcut === 'move-down') {
          event.preventDefault();
          event.stopPropagation();
          const change = shortcut === 'move-up' ? -1 : 1;
          const nextNode = getNode<MyElement>(editor, [
            anchor.path[0] + change,
          ]);
          if (nextNode && nextNode.type === ELEMENT_STRUCTURED_IN) {
            const nextText = getNodeString(nextNode.children[anchor.path[1]]);
            const newRange = {
              offset: getAlignedOffset(
                anchor.offset,
                nodeText,
                nextText,
                anchor.path[1] === 0 ? 'left' : 'right'
              ),
              path: [anchor.path[0] + change, anchor.path[1], 0],
            };
            setSelection(editor, {
              anchor: newRange,
              focus: newRange,
            });
            return true;
          }
        } else if (shortcut === 'new-element') {
          event.preventDefault();
          event.stopPropagation();
          insertStructuredInput(
            editor,
            [anchor.path[0]],
            getAvailableIdentifier
          );
        }
        return false;
      },
  })();
}
