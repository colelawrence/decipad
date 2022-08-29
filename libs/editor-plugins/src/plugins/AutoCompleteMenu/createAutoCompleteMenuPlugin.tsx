import { createPluginFactory } from '@udecode/plate';
import { DECORATE_AUTO_COMPLETE_MENU } from '../../constants';
import { AutoCompleteMenu } from './AutoCompleteMenu';

export const createAutoCompleteMenuPlugin = createPluginFactory({
  key: DECORATE_AUTO_COMPLETE_MENU,
  isLeaf: true,
  component: AutoCompleteMenu,
});
