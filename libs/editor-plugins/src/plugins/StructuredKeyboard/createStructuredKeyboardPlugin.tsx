import { Computer } from '@decipad/computer';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import {
  insertStructuredCodeLineBelow,
  isElementOfType,
} from '@decipad/editor-utils';
import {
  getEndPoint,
  getFirstNode,
  getLastNode,
  getNode,
  getNodeString,
  getStartPoint,
} from '@udecode/plate';
import { KeyboardEvent } from 'react';
import { BaseEditor, Editor, Path, Transforms } from 'slate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { setSelection } from '../NormalizeCodeBlock/utils';
import { filterStatementSeparator } from '../CodeLine/filterStatementSeparator';

type Shortcuts =
  | 'move-right'
  | 'move-left'
  | 'move-up'
  | 'move-down'
  | 'new-element'
  | 'select-all';

// In the future this function could be used by all elements to get shortcuts.
function getShortcut(
  editor: MyEditor,
  computer: Computer,
  event: KeyboardEvent
): Shortcuts | undefined {
  switch (true) {
    case event.key === 'Enter' && event.shiftKey:
      return 'new-element';
    case event.key === 'Enter':
      // True when cursor in (), {}, if, etc
      const shouldSoftBreak = filterStatementSeparator(editor, computer);
      if (shouldSoftBreak) {
        return undefined;
      }
      return 'move-right';
    case event.key === 'Tab':
      return event.shiftKey ? 'move-left' : 'move-right';
    case event.key === 'ArrowUp':
      return 'move-up';
    case event.key === 'ArrowDown':
      return 'move-down';
    case event.key === 'a' && (event.ctrlKey || event.metaKey):
      return 'select-all';
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

export function createStructuredKeyboard(computer: Computer) {
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

        const shortcut = getShortcut(editor, computer, event);
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
            const nextNode = getNode<MyElement>(editor, [anchorPath[0]]);
            const isNextSame = ALLOWED_ELEMENTS.has(nextNode?.type || '');

            if (!isNextSame || !nextNode) return false;
            event.preventDefault();
            event.stopPropagation();

            // If the destination line is shorter, our offset could be out of range. Trim it
            const maxOffset = getNodeString(nextNode).length;
            const offset = Math.min(anchorOffset, maxOffset);

            const newRange = {
              offset,
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
              computer.getAvailableIdentifier.bind(computer)
            );
            return true;

          case 'select-all':
            event.preventDefault();
            event.stopPropagation();

            const above = Editor.above(editor as BaseEditor, {
              at: selection,
              match: (n) =>
                isElementOfType(n, ELEMENT_CODE_LINE_V2_CODE) ||
                isElementOfType(n, ELEMENT_STRUCTURED_VARNAME),
            });

            if (above) {
              Transforms.select(editor as BaseEditor, above[1]);
            }

            return true;
        }

        return false;
      },
  })();
}
