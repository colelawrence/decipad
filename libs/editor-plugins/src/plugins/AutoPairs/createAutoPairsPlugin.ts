import {
  deleteText,
  getChildren,
  getNodeString,
  getParentNode,
  moveSelection,
} from '@udecode/plate';
import { ELEMENT_CODE_LINE, ELEMENT_SMART_REF } from '@decipad/editor-types';
import { Path, Range } from 'slate';
import { isElementOfType } from '@decipad/editor-utils';
import { Computer } from '@decipad/computer';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';

const pairs = [
  { start: '{', end: '}' },
  { start: '[', end: ']' },
  { start: '(', end: ')' },
];

const isAtEndOfLine = (text: string, cursorOffset: number) =>
  text[cursorOffset] === '\n' || text[cursorOffset] === undefined;

export const createAutoPairsPlugin = (computer: Computer) =>
  createOnKeyDownPluginFactory({
    name: 'AUTO_PAIR_PLUGIN',
    plugin: (editor) => (event) => {
      const { selection } = editor;

      if (selection) {
        const cursor = Range.start(selection);
        const parentEntry = getParentNode(editor, cursor);
        if (parentEntry) {
          const [node] = parentEntry;

          if (isElementOfType(node, ELEMENT_CODE_LINE)) {
            let cursorOffset = cursor.offset;
            cursorOffset =
              getChildren(parentEntry)
                .filter(([_, path]) =>
                  Path.isBefore(path, editor.selection!.anchor.path)
                )
                .reduce(
                  (acc, [n]) =>
                    isElementOfType(n, ELEMENT_SMART_REF)
                      ? acc +
                        (computer.getSymbolDefinedInBlock(n.blockId) || '')
                          .length
                      : acc + getNodeString(n).length,
                  0
                ) + cursorOffset;

            const activePair = pairs.find((pair) => pair.start === event.key);

            const nodeText = getChildren(parentEntry).reduce(
              (acc, [n]) =>
                isElementOfType(n, ELEMENT_SMART_REF)
                  ? acc + (computer.getSymbolDefinedInBlock(n.blockId) || '')
                  : acc + getNodeString(n),
              ''
            );

            if (activePair && isAtEndOfLine(nodeText, cursorOffset)) {
              event.preventDefault();
              editor.insertText(activePair.start + activePair.end);
              moveSelection(editor, {
                distance: 1,
                unit: 'offset',
                reverse: true,
              });
            }

            const endPair = pairs.find((pair) => pair.end === event.key);
            if (endPair && nodeText[cursorOffset] === endPair.end) {
              event.preventDefault();
              moveSelection(editor, {
                distance: 1,
                unit: 'offset',
              });
            }

            if (event.key === 'Backspace') {
              const startPair = pairs.find(
                (p) => p.start === nodeText[cursorOffset - 1]
              );
              const end = pairs.find((p) => p.end === nodeText[cursorOffset]);

              if (startPair && end && startPair === end) {
                moveSelection(editor, { unit: 'offset', distance: 1 });
                deleteText(editor, {
                  unit: 'character',
                  distance: 1,
                  reverse: true,
                });
              }
            }
          }
        }
      }
    },
  })();
