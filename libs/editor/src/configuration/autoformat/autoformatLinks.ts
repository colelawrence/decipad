import { allPass } from 'ramda';
import { AutoformatRule, getNode, wrapNodes, isElement } from '@udecode/plate';
import { BasePoint, Editor, Path, Text, Transforms } from 'slate';
import { ELEMENT_LINK, LinkElement, Node } from '@decipad/editor-types';
import { requireCollapsedSelection } from '../../utils/selection';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';
import { getTrailingLink } from '../../utils/link';

const TRIGGER = ')';

const getTextBeforeCursorWithTrigger = (editor: Editor, cursor: BasePoint) => {
  return (
    Editor.string(editor, {
      anchor: { path: cursor.path, offset: 0 },
      focus: { path: cursor.path, offset: cursor.offset },
    }) + TRIGGER
  );
};

const doesTriggerCompleteLink = (editor: Editor) => {
  return (
    getTrailingLink(
      getTextBeforeCursorWithTrigger(editor, requireCollapsedSelection(editor))
    ) !== null
  );
};

const convertPrecedingTextWithTriggerToLink = (editor: Editor): void => {
  const cursor = requireCollapsedSelection(editor);
  const link = getTrailingLink(getTextBeforeCursorWithTrigger(editor, cursor));
  if (link === null) {
    throw new Error(
      'Trigger does not complete a link given the preceding text. Check doesTriggerCompleteLink first.'
    );
  }

  let { path } = cursor;
  wrapNodes<Omit<LinkElement, 'id'>>(
    editor,
    {
      type: ELEMENT_LINK,
      url: link.url,
      children: [],
    },
    {
      at: {
        anchor: { path, offset: link.startOffset },
        focus: { path, offset: cursor.offset },
      },
      split: true,
      match: Text.isText,
    }
  );

  let node = getNode<Node>(editor, path);
  if (!(isElement(node) && node.type === ELEMENT_LINK)) {
    // There was a split at the start (because there was text before the link)
    path = Path.next(path);
  }
  node = getNode<Node>(editor, path);
  if (!(isElement(node) && node.type === ELEMENT_LINK)) {
    throw new Error('Cannot find created link after split');
  }

  Transforms.insertText(editor, link.text, { at: [...path, 0] });
};

export const autoformatLinks: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LINK,
    triggerAtBlockStart: false,
    match: TRIGGER,
    query: allPass([doesSelectionAllowTextStyling, doesTriggerCompleteLink]),
    format: convertPrecedingTextWithTriggerToLink,
  },
];
