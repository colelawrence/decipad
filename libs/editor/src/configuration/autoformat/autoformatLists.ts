import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
  MyAutoformatRule,
} from '@decipad/editor-types';
import { toggleList } from '@udecode/plate';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

export const autoformatLists: MyAutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['* ', '- '],
    query: doesSelectionAllowTextStyling,
    format: (editor) => toggleList(editor, { type: ELEMENT_UL }),
  },
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['0. ', '0) ', '1. ', '1) '],
    query: doesSelectionAllowTextStyling,
    format: (editor) => toggleList(editor, { type: ELEMENT_OL }),
  },
];
