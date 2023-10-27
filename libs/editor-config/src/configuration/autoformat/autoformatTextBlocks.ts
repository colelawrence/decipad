import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
} from '@decipad/editor-types';
import {
  autoformatArrow,
  autoformatPunctuation,
  someNode,
  TEditor,
  deleteText,
  Value,
  AutoformatRule,
} from '@udecode/plate';
import { autoformatImages } from './autoformatImages';
import { autoformatLinks } from './autoformatLinks';
import { autoformatLists } from './autoformatLists';
import { autoformatMarks } from './autoformatMarks';
import {
  insertDividerBelow,
  requireCollapsedSelection,
} from '@decipad/editor-utils';
import { Path } from 'slate';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

/** Prevent arrow rules to be applied in codelines,
 * like <= becoming ⇐ */
function disableCodelineFormatting(editor: TEditor) {
  return (
    !someNode(editor, {
      match: { type: ELEMENT_CODE_LINE },
    }) &&
    !someNode(editor, {
      match: { type: ELEMENT_CODE_LINE_V2_CODE },
    })
  );
}

const rulesForbiddenInCodeLines = [
  ...autoformatPunctuation,
  ...autoformatArrow,
].map((rule) => ({
  ...rule,
  query: disableCodelineFormatting,
}));

export const autoformatTextBlockRules = <
  TV extends Value,
  TE extends TEditor<TV> = TEditor<TV>
>() =>
  [
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
      format: (editor: TE): void => {
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
    ...autoformatLists,
    ...autoformatMarks,
    ...autoformatLinks,
    ...autoformatImages,
    ...rulesForbiddenInCodeLines,
  ] as Array<AutoformatRule<TV>>;
