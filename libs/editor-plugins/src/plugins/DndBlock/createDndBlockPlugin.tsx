import { createMyPluginFactory } from '@decipad/editor-types';
import { DndBlockOverlay } from './DndBlockOverlay';

export const KEY_DND_BLOCK = 'dndBlock';

export const createDndBlockPlugin = createMyPluginFactory({
  key: KEY_DND_BLOCK,
  renderAfterEditable: DndBlockOverlay,
});
