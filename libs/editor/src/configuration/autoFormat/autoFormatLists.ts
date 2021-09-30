import { AutoformatRule, ELEMENT_LI, ELEMENT_UL } from '@udecode/plate';
import { formatList } from './utils/formatList';
import { preFormat } from './utils/preFormat';

export const autoFormatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['* ', '- '],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_UL),
  },
];
