/* istanbul ignore file */
import {
  ELEMENT_INLINE_NUMBER,
  InlineNumberElement,
  MyEditor,
} from '@decipad/editor-types';
import { getCollapsedSelection, isElementOfType } from '@decipad/editor-utils';
import { getAboveNode, insertNodes, isText } from '@udecode/plate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { isCursorNextToNonSpace } from './helpers';

const CREATE_BUBBLE_REGEX = /([$£€₴₹₽¢฿₮¥]|[0-9])/;

const insertNumberBubble = (editor: MyEditor) => {
  const emptyElement: Omit<InlineNumberElement, 'id'> = {
    type: ELEMENT_INLINE_NUMBER,
    name: '',
    children: [{ text: '' }],
  };
  insertNodes(editor, emptyElement as InlineNumberElement, { match: isText });
};

export const createNumberBubblesPlugin = createOnKeyDownPluginFactory({
  name: 'NUMBER_BUBBLES_PLUGIN',
  plugin: (editor) => (event) => {
    const { selection } = editor;
    if (!selection) return;

    const cursor = getCollapsedSelection(editor); // change to getCollapsedSelection (no throw)
    if (!cursor) return;

    const nodeEntry = getAboveNode(editor, { at: cursor });
    if (!nodeEntry) return;

    const node = nodeEntry[0];
    const isBubble = isElementOfType(node, ELEMENT_INLINE_NUMBER);

    if (isBubble) return;
    if (!event.key.match(CREATE_BUBBLE_REGEX)) return;
    if (!isCursorNextToNonSpace(editor)) return;

    insertNumberBubble(editor);
  },
});
