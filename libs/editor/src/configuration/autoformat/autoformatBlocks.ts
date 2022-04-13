import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
} from '@decipad/editor-types';
import { AutoformatRule, TEditor } from '@udecode/plate';
import {
  insertCodeLineBelowOrReplace,
  insertDividerBelow,
  requireCollapsedSelection,
} from '@decipad/editor-utils';
import { Path, Transforms } from 'slate';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

export const autoformatBlocks: AutoformatRule[] = [
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
    format: (editor: TEditor): void => {
      const { path } = requireCollapsedSelection(editor);
      insertDividerBelow(editor, path, ELEMENT_HR);
      Transforms.delete(editor, { at: Path.parent(path), unit: 'block' });
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
