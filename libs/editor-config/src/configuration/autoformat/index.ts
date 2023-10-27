import { type RemoteComputer } from '@decipad/remote-computer';
import { MyAutoformatRule } from '@decipad/editor-types';

import { autoformatCodeBlocks } from './autoformatCodeBlocks';
import { autoformatTextBlockRules } from './autoformatTextBlocks';

export const autoformatRules = (computer: RemoteComputer) =>
  [
    ...autoformatTextBlockRules(),
    ...autoformatCodeBlocks(computer),
  ] as MyAutoformatRule[];

export { autoformatTextBlockRules };
