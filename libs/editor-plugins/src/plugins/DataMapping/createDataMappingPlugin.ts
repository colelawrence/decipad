import { DataMapping, DataMappingRow } from '@decipad/editor-components';
import {
  ELEMENT_DATA_MAPPING,
  ELEMENT_DATA_MAPPING_ROW,
  MyPlatePlugin,
} from '@decipad/editor-types';
import { createEventInterceptorPluginFactory } from '../../pluginFactories';

export const createDataMappingPlugin = (): MyPlatePlugin => ({
  key: ELEMENT_DATA_MAPPING,
  isElement: true,
  isVoid: false,
  component: DataMapping,
  plugins: [
    {
      key: ELEMENT_DATA_MAPPING_ROW,
      isElement: true,
      isVoid: false,
      component: DataMappingRow,
    },
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_DATA_SET',
      elementTypes: [ELEMENT_DATA_MAPPING, ELEMENT_DATA_MAPPING_ROW],
      interceptor: () => {
        return true;
      },
    })(),
  ],
});
