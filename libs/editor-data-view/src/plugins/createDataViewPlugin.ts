import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_TH,
  ELEMENT_DATA_VIEW_TR,
} from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate';
import {
  DataView,
  DataViewColumnHeader,
  DataViewColumnHeaderRow,
} from '../components';
import { createNormalizeDataViewPlugin } from './createNormalizeDataViewPlugin';

export const createDataViewPlugin = createPluginFactory({
  key: ELEMENT_DATA_VIEW,
  isElement: true,
  component: DataView,
  plugins: [
    {
      key: ELEMENT_DATA_VIEW_TR,
      isElement: true,
      isVoid: false,
      component: DataViewColumnHeaderRow,
    },
    {
      key: ELEMENT_DATA_VIEW_TH,
      isElement: true,
      component: DataViewColumnHeader,
    },
    createNormalizeDataViewPlugin(),
  ],
});
