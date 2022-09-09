/* istanbul ignore file */
import { ELEMENT_INLINE_NUMBER } from '@decipad/editor-types';
import { getCollapsedSelection, isElementOfType } from '@decipad/editor-utils';
import { getAboveNode, getNodeString, removeNodes } from '@udecode/plate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import {
  cleanUpInlineNumber,
  focusInlineNumberEnd,
  focusInlineNumberStart,
  isSelectionBordersBubble,
  jumpOutInlineNumber,
} from './helpers';

const END_EDITING_KEYS = ['Tab', 'Enter', ' '];
const NAVIGATION_KEYS = ['ArrowLeft', 'ArrowRight'];
const DELETE_KEYS = ['Backspace', 'Delete'];

export const createBubblesHotkeysPlugin = createOnKeyDownPluginFactory({
  name: 'NUMBER_BUBBLES_HOTKEYS_PLUGIN',
  plugin: (editor) => (event) => {
    const { selection } = editor;
    if (!selection) return;

    const cursor = getCollapsedSelection(editor);
    if (!cursor) return;

    const nodeEntry = getAboveNode(editor, { at: cursor });
    if (!nodeEntry) return;

    const node = nodeEntry[0];
    const isBubble = isElementOfType(node, ELEMENT_INLINE_NUMBER);

    if (!isBubble) {
      if (!NAVIGATION_KEYS.includes(event.key)) return;

      const borderingSide = isSelectionBordersBubble(editor);
      if (borderingSide == null) return;

      if (borderingSide === 'left') focusInlineNumberStart(editor);
      if (borderingSide === 'right') focusInlineNumberEnd(editor);

      return;
    }

    const nodeString = getNodeString(node);

    if (DELETE_KEYS.includes(event.key)) {
      const isEmpty = nodeString.trim() === '';
      if (!isEmpty) return;

      event.preventDefault();
      removeNodes(editor, { at: nodeEntry[1] });
      return;
    }

    if (END_EDITING_KEYS.includes(event.key)) {
      event.preventDefault();

      cleanUpInlineNumber(editor, node);
      jumpOutInlineNumber(editor, node);
      return;
    }

    const pressedSpace = event.key === ' ';
    const endsWithSpace = nodeString.endsWith(' ');

    if (pressedSpace && endsWithSpace) {
      event.preventDefault();

      cleanUpInlineNumber(editor, node);
      jumpOutInlineNumber(editor, node);
    }
  },
});
