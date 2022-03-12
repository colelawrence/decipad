import { AutoformatRule, SPEditor, toggleList } from '@udecode/plate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '@decipad/editor-types';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['* ', '- '],
    query: doesSelectionAllowTextStyling,
    format: (editor) => toggleList(editor as SPEditor, { type: ELEMENT_UL }),
  },
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['0. ', '0) ', '1. ', '1) '],
    query: doesSelectionAllowTextStyling,
    format: (editor) => toggleList(editor as SPEditor, { type: ELEMENT_OL }),
  },
];
