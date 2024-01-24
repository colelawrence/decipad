import { Spoiler } from '@decipad/editor-components';
import { createMyPluginFactory, MARK_SPOILER } from '@decipad/editor-types';

export const createSpoilerPlugin = createMyPluginFactory({
  key: MARK_SPOILER,
  type: MARK_SPOILER,
  isInline: true,
  isVoid: false,
  isLeaf: true,
  component: Spoiler,
});
