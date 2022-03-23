import { autoformatBlocks } from './autoformatBlocks';
import { autoformatLinks } from './autoformatLinks';
import { autoformatLists } from './autoformatLists';
import { autoformatMarks } from './autoformatMarks';

export const autoformatRules = [
  ...autoformatBlocks,
  ...autoformatLists,
  ...autoformatMarks,
  ...autoformatLinks,
];
