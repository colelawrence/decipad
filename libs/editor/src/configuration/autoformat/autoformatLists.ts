import {
  AutoformatRule,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
  SPEditor,
  toggleList,
} from '@udecode/plate';
import { isSelectionInParagraph } from './isSelectionInParagraph';

export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['* ', '- '],
    query: isSelectionInParagraph,
    format: (editor) => toggleList(editor as SPEditor, { type: ELEMENT_UL }),
  },
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['0. ', '0) ', '1. ', '1) '],
    query: isSelectionInParagraph,
    format: (editor) => toggleList(editor as SPEditor, { type: ELEMENT_OL }),
  },
];
