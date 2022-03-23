import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '@decipad/editor-types';
import { AutoformatRule, PlateEditor, toggleList } from '@udecode/plate';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['* ', '- '],
    query: doesSelectionAllowTextStyling,
    format: (editor) => toggleList(editor as PlateEditor, { type: ELEMENT_UL }),
  },
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['0. ', '0) ', '1. ', '1) '],
    query: doesSelectionAllowTextStyling,
    format: (editor) => toggleList(editor as PlateEditor, { type: ELEMENT_OL }),
  },
];
