import { ELEMENT_CODE_LINE, MyAutoformatRule } from '@decipad/editor-types';
import {
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  autoformatPunctuation,
  autoformatSmartQuotes,
  someNode,
  TEditor,
} from '@udecode/plate';
import { autoformatBlocks } from './autoformatBlocks';
import { autoformatImages } from './autoformatImages';
import { autoformatLinks } from './autoformatLinks';
import { autoformatLists } from './autoformatLists';
import { autoformatMarks } from './autoformatMarks';

//
// Prevent arrow rules to be applied in codelines, like <= becoming ⇐
//
function disableCodelineFormatting(editor: TEditor) {
  return !someNode(editor, {
    match: { type: ELEMENT_CODE_LINE },
  });
}

const rulesForbiddenInCodeLines = [
  autoformatArrow,
  autoformatPunctuation,
  autoformatLegal,
  autoformatSmartQuotes,
  autoformatLegalHtml,
  autoformatMath,
].flatMap((ruleSet) =>
  ruleSet.map((rule) => ({
    ...rule,
    query: disableCodelineFormatting,
  }))
);

export const autoformatRules = [
  ...autoformatBlocks,
  ...autoformatLists,
  ...autoformatMarks,
  ...autoformatLinks,
  ...autoformatImages,
  ...rulesForbiddenInCodeLines,
] as MyAutoformatRule[];
