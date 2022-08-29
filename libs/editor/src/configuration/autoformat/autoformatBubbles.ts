import {
  BubbleElement,
  ELEMENT_BUBBLE,
  MyAutoformatRule,
  MyEditor,
} from '@decipad/editor-types';
import {
  requireCollapsedSelection,
  selectionIsNotBubble,
} from '@decipad/editor-utils';
import { insertNodes, isText } from '@udecode/plate';
import { isEnabled } from '@decipad/feature-flags';
import { allPass } from 'ramda';
import words from 'random-words';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

const convertPrecedingTextToBubble = (editor: MyEditor): void => {
  requireCollapsedSelection(editor);

  const emptyElement: Omit<BubbleElement, 'id'> = {
    type: ELEMENT_BUBBLE,
    opened: true,
    formula: {
      name: words(3).join('_'),
      expression: `${Math.floor(Math.random() * 5000)}`,
    },
    children: [{ text: '' }],
  };

  insertNodes(editor, emptyElement as BubbleElement, {
    match: isText,
  });
};

export const autoformatBubbles: MyAutoformatRule[] = isEnabled('INLINE_BUBBLES')
  ? [
      {
        mode: 'block',
        type: ELEMENT_BUBBLE,
        triggerAtBlockStart: false,
        match: '+',
        query: allPass([doesSelectionAllowTextStyling, selectionIsNotBubble]),
        format: convertPrecedingTextToBubble,
      },
    ]
  : [];
