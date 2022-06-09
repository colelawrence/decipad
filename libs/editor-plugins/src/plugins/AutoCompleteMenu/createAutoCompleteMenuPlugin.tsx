import { createPluginFactory } from '@udecode/plate';
import { AutoCompleteMenu } from '@decipad/editor-components';
import { DECORATE_AUTO_COMPLETE_MENU } from '../../constants';

export const createAutoCompleteMenuPlugin = createPluginFactory({
  key: DECORATE_AUTO_COMPLETE_MENU,
  isLeaf: true,
  component: AutoCompleteMenu,
});
