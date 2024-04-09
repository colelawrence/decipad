import { createPluginFactory } from '@udecode/plate-common';
import { DECORATE_AUTO_COMPLETE_MENU } from '../../constants';
import { AutoCompleteMenu } from './AutoCompleteMenu';
import type { AutoCompletePlugin } from './types';

export const createAutoCompleteMenuPlugin =
  createPluginFactory<AutoCompletePlugin>({
    key: DECORATE_AUTO_COMPLETE_MENU,
    isLeaf: true,
    component: AutoCompleteMenu,
  });
