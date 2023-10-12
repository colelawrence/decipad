import { type RemoteComputer } from '@decipad/remote-computer';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  MyAutoformatRule,
} from '@decipad/editor-types';
import {
  autoformatArrow,
  autoformatPunctuation,
  someNode,
  TEditor,
} from '@udecode/plate';
import { autoformatBlocks } from './autoformatBlocks';
import { autoformatImages } from './autoformatImages';
import { autoformatLinks } from './autoformatLinks';
import { autoformatLists } from './autoformatLists';
import { autoformatMarks } from './autoformatMarks';

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

export const autoformatRules = (computer: RemoteComputer) =>
  [
    ...autoformatBlocks(computer),
    ...autoformatLists,
    ...autoformatMarks,
    ...autoformatLinks,
    ...autoformatImages,
    ...rulesForbiddenInCodeLines,
  ] as MyAutoformatRule[];
