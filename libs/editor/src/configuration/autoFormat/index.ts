import { autoFormatBlocks } from './autoFormatBlocks';
import { autoFormatLists } from './autoFormatLists';
import { autoformatMarks } from './autoFormatMarks';

export const autoFormatRules = {
  rules: [...autoFormatBlocks, ...autoFormatLists, ...autoformatMarks],
};
