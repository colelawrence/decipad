import { createTPluginFactory, ELEMENT_PLOT } from '@decipad/editor-types';
import { Plot } from '@decipad/editor-components';

export const createPlotPlugin = createTPluginFactory({
  key: ELEMENT_PLOT,
  isElement: true,
  component: Plot,
});
