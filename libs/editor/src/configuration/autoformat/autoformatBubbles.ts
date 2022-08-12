import {
  BubbleElement,
  ELEMENT_BUBBLE,
  MyAutoformatRule,
  MyEditor,
} from '@decipad/editor-types';
import { requireCollapsedSelection } from '@decipad/editor-utils';
import { insertNodes, isText } from '@udecode/plate';
import words from 'random-words';
import { isEnabled } from '@decipad/feature-flags';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

const convertPrecedingTextWithTriggerToImage = (editor: MyEditor): void => {
  requireCollapsedSelection(editor);

  const emptyElement: Omit<BubbleElement, 'id'> = {
    type: ELEMENT_BUBBLE,
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
        query: doesSelectionAllowTextStyling,
        format: convertPrecedingTextWithTriggerToImage,
      },
    ]
  : [];
