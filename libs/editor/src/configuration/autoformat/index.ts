import { MyAutoformatRule } from '@decipad/editor-types';
import { autoformatArrow, autoformatPunctuation } from '@udecode/plate';
import { autoformatBlocks } from './autoformatBlocks';
import { autoformatImages } from './autoformatImages';
import { autoformatLinks } from './autoformatLinks';
import { autoformatLists } from './autoformatLists';
import { autoformatMarks } from './autoformatMarks';

export const autoformatRules = [
  ...autoformatBlocks,
  ...autoformatLists,
  ...autoformatMarks,
  ...autoformatLinks,
  ...autoformatImages,
  ...autoformatPunctuation,
  ...autoformatArrow,
] as MyAutoformatRule[];
