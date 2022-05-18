import { autoformatArrow, autoformatPunctuation } from '@udecode/plate';
import { MyAutoformatRule } from '@decipad/editor-types';
import { autoformatBlocks } from './autoformatBlocks';
import { autoformatLinks } from './autoformatLinks';
import { autoformatLists } from './autoformatLists';
import { autoformatMarks } from './autoformatMarks';

export const autoformatRules = [
  ...autoformatBlocks,
  ...autoformatLists,
  ...autoformatMarks,
  ...autoformatLinks,
  ...autoformatPunctuation,
  ...autoformatArrow,
] as MyAutoformatRule[];
