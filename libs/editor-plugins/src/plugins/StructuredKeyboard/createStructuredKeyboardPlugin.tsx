import type { RemoteComputer } from '@decipad/remote-computer';
import {
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  MyEditor,
} from '@decipad/editor-types';
import {
  insertStructuredCodeLineBelow,
  isElementOfType,
  setSelection,
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
import { filterStatementSeparator } from '../CodeLine/filterStatementSeparator';
import utils from './structured_utils';

type Shortcuts =
  | 'move-right'
  | 'move-left'
  | 'move-up'
  | 'move-down'
  | 'new-element'
  | 'select-all'
  | 'soft-break';

// In the future this function could be used by all elements to get shortcuts.
function getShortcut(
  editor: MyEditor,
  computer: RemoteComputer,
  event: KeyboardEvent
): Shortcuts | undefined {
  switch (true) {
    case event.key === 'Enter' && event.shiftKey:
      return 'new-element';
    case event.key === 'Enter':
      // True when cursor in (), {}, if, etc
      const shouldSoftBreak = filterStatementSeparator(editor, computer);
      if (shouldSoftBreak) {
        return 'soft-break';
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

export function createStructuredKeyboard(computer: RemoteComputer) {
  return createOnKeyDownPluginFactory({
    name: 'STRUCTURED_KEYBOARD_SHORTCUTS',
    plugin:
      (editor) =>
      // eslint-disable-next-line complexity
      (event): boolean => {
        const { selection } = editor;
        if (!selection) return false;
        const anchorPath = [...selection.anchor.path];
        const anchorOffset = selection.anchor.offset;

        const node = getNode<CodeLineV2Element>(editor, [anchorPath[0]]);
        if (!node || !ALLOWED_ELEMENTS.has(node.type)) return false;

        const shortcut = getShortcut(editor, computer, event);
        switch (shortcut) {
          case 'move-left':
          case 'move-right':
            if (
              (anchorPath[1] === 0 && shortcut === 'move-right') ||
              (anchorPath[1] === 1 && shortcut === 'move-left')
            ) {
              event.preventDefault();
              event.stopPropagation();
              anchorPath[1] = shortcut === 'move-right' ? 1 : 0;

              // We remove the last part of the path so that we can
              // select the WHOLE of the code element (including smart refs);
              anchorPath.pop();
              setSelectionFullText(editor, anchorPath);
              return true;
            }

            // If we are moving right and at the end, we move down to the next element
            // And vise versa for the left
            const moveTo = [
              anchorPath[0] + (shortcut === 'move-right' ? 1 : -1),
            ];
            if (!Editor.hasPath(editor as BaseEditor, moveTo)) {
              return false;
            }
            event.preventDefault();
            event.stopPropagation();
            const [, path] =
              shortcut === 'move-right'
                ? getFirstNode(editor, moveTo)
                : getLastNode(editor, moveTo);
            path.pop();
            setSelectionFullText(editor, path);
            return true;
          case 'move-up':
          case 'move-down':
            anchorPath[0] += shortcut === 'move-up' ? -1 : 1;
            const nextNode = getNode<CodeLineV2Element>(editor, [
              anchorPath[0],
            ]);
            const isNextSame = ALLOWED_ELEMENTS.has(nextNode?.type || '');

            if (!isNextSame || !nextNode) return true;
            event.preventDefault();
            event.stopPropagation();

            if (anchorPath[1] === 0) {
              const nextNameLength = getNodeString(nextNode.children[0]).length;
              const newSelectionPoint = {
                offset: Math.min(nextNameLength, anchorOffset),
                path: anchorPath,
              };
              setSelection(editor, {
                anchor: newSelectionPoint,
                focus: newSelectionPoint,
              });
              return true;
            }

            const selectionLength = utils.getSelectionLength(
              node,
              anchorPath[2],
              anchorOffset
            );
            const [newPath, newOffset] = utils.getTargetSelection(
              nextNode,
              selectionLength
            );

            const newSelectionPoint = {
              offset: newOffset,
              path: [anchorPath[0], anchorPath[1], newPath],
            };
            setSelection(editor, {
              anchor: newSelectionPoint,
              focus: newSelectionPoint,
            });
            return true;
          case 'new-element':
            event.preventDefault();
            event.stopPropagation();
            insertStructuredCodeLineBelow({
              editor,
              path: [anchorPath[0]],
              code: '$100',
              select: true,
              getAvailableIdentifier:
                computer.getAvailableIdentifier.bind(computer),
            });
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

          case 'soft-break':
            event.preventDefault();
            event.stopPropagation();

            editor.insertText('\n');

            return true;
        }

        return false;
      },
  })();
}
