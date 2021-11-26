import {
  AutoformatRule,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
  TEditor,
} from '@udecode/plate';
import { insertCodeBlockBelowOrReplace } from '../../utils/codeBlock';
import { requireSelectionPath } from '../../utils/selection';
import { isSelectionInParagraph } from './isSelectionInParagraph';

export const autoformatBlocks: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_H2,
    match: '## ',
    query: isSelectionInParagraph,
  },
  {
    mode: 'block',
    type: ELEMENT_H3,
    match: '### ',
    query: isSelectionInParagraph,
  },
  {
    mode: 'block',
    type: ELEMENT_BLOCKQUOTE,
    match: '> ',
    query: isSelectionInParagraph,
  },
  {
    mode: 'block',
    type: ELEMENT_CODE_BLOCK,
    match: '```',
    query: isSelectionInParagraph,
    triggerAtBlockStart: false,
    format: (editor: TEditor): void =>
      insertCodeBlockBelowOrReplace(editor, requireSelectionPath(editor), true),
  },
];
