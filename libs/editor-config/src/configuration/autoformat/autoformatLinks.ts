import {
  ELEMENT_LINK,
  LinkElement,
  MyAutoformatRule,
  MyEditor,
  MyNode,
} from '@decipad/editor-types';
import { requireCollapsedSelection } from '@decipad/editor-utils';
import {
  getEditorString,
  getNode,
  insertText,
  isElement,
  isText,
  wrapNodes,
} from '@udecode/plate-common';
import { BasePoint, Path } from 'slate';
import { getTrailingLink } from '../../utils/link';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

const TRIGGER = ')';

const getTextBeforeCursorWithTrigger = (
  editor: MyEditor,
  cursor: BasePoint
) => {
  return (
    getEditorString(editor, {
      anchor: { path: cursor.path, offset: 0 },
      focus: { path: cursor.path, offset: cursor.offset },
    }) + TRIGGER
  );
};

const doesTriggerCompleteLink = (editor: MyEditor) => {
  return (
    getTrailingLink(
      getTextBeforeCursorWithTrigger(editor, requireCollapsedSelection(editor))
    ) !== null
  );
};

const convertPrecedingTextWithTriggerToLink = (editor: MyEditor): void => {
  const cursor = requireCollapsedSelection(editor);
  const link = getTrailingLink(getTextBeforeCursorWithTrigger(editor, cursor));
  if (link === null) {
    throw new Error(
      'Trigger does not complete a link given the preceding text. Check doesTriggerCompleteLink first.'
    );
  }

  let { path } = cursor;
  wrapNodes(
    editor,
    {
      type: ELEMENT_LINK,
      url: link.url,
      children: [],
    } as unknown as LinkElement,
    {
      at: {
        anchor: { path, offset: link.startOffset },
        focus: { path, offset: cursor.offset },
      },
      split: true,
      match: isText,
    }
  );

  let node = getNode<MyNode>(editor, path);
  if (!(isElement(node) && node.type === ELEMENT_LINK)) {
    // There was a split at the start (because there was text before the link)
    path = Path.next(path);
  }
  node = getNode<MyNode>(editor, path);
  if (!(isElement(node) && node.type === ELEMENT_LINK)) {
    console.error(
      'Cannot find created link after split. Editor children:',
      editor.children,
      '. Searched path',
      path,
      'and the previous path'
    );
    throw new Error('Cannot find created link after split');
  }

  insertText(editor, link.text, { at: [...path, 0] });
};

export const autoformatLinks: MyAutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LINK,
    triggerAtBlockStart: false,
    match: TRIGGER,
    query: (editor) =>
      doesSelectionAllowTextStyling(editor) && doesTriggerCompleteLink(editor),
    format: convertPrecedingTextWithTriggerToLink,
  },
];
