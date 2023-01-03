import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CODE_LINE,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  MyAutoformatRule,
} from '@decipad/editor-types';
import { deleteText } from '@udecode/plate';
import {
  insertCodeLineBelowOrReplace,
  insertDividerBelow,
  requireCollapsedSelection,
} from '@decipad/editor-utils';
import { Path } from 'slate';
import { Computer } from '@decipad/computer';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

export const autoformatBlocks = (computer: Computer): MyAutoformatRule[] => [
  {
    mode: 'block',
    type: ELEMENT_H2,
    match: '# ',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'block',
    type: ELEMENT_H3,
    match: '## ',
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
    type: ELEMENT_HR,
    match: ['---', '—-', '~~~'],
    query: doesSelectionAllowTextStyling,
    format: (editor): void => {
      const { path } = requireCollapsedSelection(editor);
      insertDividerBelow(editor, path, ELEMENT_HR);
      deleteText(editor, { at: Path.parent(path), unit: 'block' });
    },
  },
  {
    mode: 'block',
    type: ELEMENT_CALLOUT,
    match: '>! ',
    query: doesSelectionAllowTextStyling,
  },
  {
    mode: 'block',
    type: ELEMENT_CODE_LINE,
    match: '```',
    query: doesSelectionAllowTextStyling,
    triggerAtBlockStart: false,
    format: (editor): void =>
      insertCodeLineBelowOrReplace(
        editor,
        requireCollapsedSelection(editor).path,
        true,
        computer.getAvailableIdentifier.bind(computer)
      ),
  },
];
