import { createTPluginFactory, ELEMENT_PLOT } from '@decipad/editor-types';
import { lazyElementComponent } from '../../utils/lazyElement';

const LazyPlot = lazyElementComponent(
  () => import(/* webpackChunkName: "editor-plot" */ './Plot')
);

export const createPlotPlugin = createTPluginFactory({
  key: ELEMENT_PLOT,
  isElement: true,
  component: LazyPlot,
});
