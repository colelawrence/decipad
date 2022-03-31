import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
} from '@decipad/editor-types';
import { AutoformatRule, TEditor } from '@udecode/plate';
import {
  insertCodeLineBelowOrReplace,
  requireCollapsedSelection,
} from '@decipad/editor-utils';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

export const autoformatBlocks: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_H2,
    match: '## ',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'block',
    type: ELEMENT_H3,
    match: '### ',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'block',
    type: ELEMENT_BLOCKQUOTE,
    match: '> ',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'block',
    type: ELEMENT_CODE_BLOCK,
    match: '```',
    query: doesSelectionAllowTextStyling,
    triggerAtBlockStart: false,
    format: (editor: TEditor): void =>
      insertCodeLineBelowOrReplace(
        editor,
        requireCollapsedSelection(editor).path,
        true
      ),
  },
];
