import { Computer } from '@decipad/computer-interfaces';
import { MyAutoformatRule } from '@decipad/editor-types';

import { autoformatCodeBlocks } from './autoformatCodeBlocks';
import { autoformatTextBlockRules } from './autoformatTextBlocks';

export const autoformatRules = (computer: Computer) =>
  [
    ...autoformatTextBlockRules(),
    ...autoformatCodeBlocks(computer),
  ] as MyAutoformatRule[];

export { autoformatTextBlockRules };
