/* eslint-disable no-param-reassign */
import { createMyPluginFactory, ELEMENT_LAYOUT } from '@decipad/editor-types';
import { Layout } from '@decipad/editor-components';

export const createLayoutPlugin = createMyPluginFactory({
  key: ELEMENT_LAYOUT,
  isElement: true,
  component: Layout,
});
