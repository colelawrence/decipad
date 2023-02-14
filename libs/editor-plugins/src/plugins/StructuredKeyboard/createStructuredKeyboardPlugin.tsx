import { Computer } from '@decipad/computer';
import {
  ELEMENT_CODE_LINE_V2,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import { insertStructuredCodeLineBelow } from '@decipad/editor-utils';
import {
  getEndPoint,
  getFirstNode,
  getLastNode,
  getNode,
  getStartPoint,
} from '@udecode/plate';
import { KeyboardEvent } from 'react';
import { Path } from 'slate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { setSelection } from '../NormalizeCodeBlock/utils';

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

/**
 * Selects the whole text on a given path.
 *
 * If you have a text note `1234`, the anchor will stay before 1 and the focus
 * after 4, as to select the whole text.
 */
function setSelectionFullText(editor: MyEditor, path: Path) {
  setSelection(editor, {
    anchor: getStartPoint(editor, path),
    focus: getEndPoint(editor, path),
  });
}

const ALLOWED_ELEMENTS = new Set([ELEMENT_CODE_LINE_V2]);

export function createStructuredKeyboard(
  getAvailableIdentifier: Computer['getAvailableIdentifier']
) {
  return createOnKeyDownPluginFactory({
    name: 'STRUCTURED_KEYBOARD_SHORTCUTS',
    plugin:
      (editor) =>
      (event): boolean => {
        const { selection } = editor;
        if (!selection) return false;
        const anchorPath = [...selection.anchor.path];
        const anchorOffset = selection.anchor.offset;

        const node = getNode<MyElement>(editor, [anchorPath[0]]);
        if (!node || !ALLOWED_ELEMENTS.has(node.type)) return false;

        const shortcut = getShortcut(event);
        switch (shortcut) {
          case 'move-left':
          case 'move-right':
            event.preventDefault();
            event.stopPropagation();
            if (
              (anchorPath[1] === 0 && shortcut === 'move-right') ||
              (anchorPath[1] === 1 && shortcut === 'move-left')
            ) {
              anchorPath[1] = shortcut === 'move-right' ? 1 : 0;
              setSelectionFullText(editor, anchorPath);
              return true;
            }

            // If we are moving right and at the end, we move down to the next element
            // And vise versa for the left
            anchorPath[0] += shortcut === 'move-right' ? 1 : -1;
            const [, path] =
              shortcut === 'move-right'
                ? getFirstNode(editor, [anchorPath[0]])
                : getLastNode(editor, [anchorPath[0]]);
            setSelectionFullText(editor, path);
            return true;
          case 'move-up':
          case 'move-down':
            anchorPath[0] += shortcut === 'move-up' ? -1 : 1;
            const isNextSame = ALLOWED_ELEMENTS.has(
              getNode<MyElement>(editor, [anchorPath[0]])?.type || ''
            );

            if (!isNextSame) return false;
            event.preventDefault();
            event.stopPropagation();

            const newRange = {
              offset: anchorOffset,
              path: anchorPath,
            };
            setSelection(editor, {
              anchor: newRange,
              focus: newRange,
            });
            return true;
          case 'new-element':
            event.preventDefault();
            event.stopPropagation();
            insertStructuredCodeLineBelow(
              editor,
              [anchorPath[0]],
              false,
              getAvailableIdentifier
            );
            return true;
        }

        return false;
      },
  })();
}
