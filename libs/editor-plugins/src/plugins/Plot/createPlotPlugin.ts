import { createPluginFactory } from '@udecode/plate';
import { ELEMENT_PLOT } from '@decipad/editor-types';
import { Plot } from '@decipad/editor-components';

export const createPlotPlugin = createPluginFactory({
  key: ELEMENT_PLOT,
  isElement: true,
  component: Plot,
});
