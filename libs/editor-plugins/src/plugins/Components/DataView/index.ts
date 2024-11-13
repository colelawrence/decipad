import { createMigrateDataviewPlugin } from '../../Migrations';
import { createEventInterceptorPluginFactory } from '@decipad/editor-plugin-factories';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_TH,
  ELEMENT_DATA_VIEW_TR,
} from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate-common';
import {
  DataView,
  DataViewCaption,
  DataViewColumnHeader,
  DataViewColumnHeaderRow,
} from '@decipad/editor-components';
import { createNormalizeDataViewPlugin } from './createNormalizeDataViewPlugin';
import { createNormalizeDataViewHeaderAggregationPlugin } from './createNormalizeDataViewHeaderAggregationPlugin';

export const createDataViewPlugin = createPluginFactory({
  key: ELEMENT_DATA_VIEW,
  isElement: true,
  component: DataView,
  plugins: [
    {
      key: ELEMENT_DATA_VIEW_CAPTION,
      isElement: true,
      component: DataViewCaption,
    },
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
    createNormalizeDataViewHeaderAggregationPlugin(),
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_DATA_VIEW',
      elementTypes: [ELEMENT_DATA_VIEW],
      interceptor: () => true,
    })(),
    createMigrateDataviewPlugin(),
  ],
});
