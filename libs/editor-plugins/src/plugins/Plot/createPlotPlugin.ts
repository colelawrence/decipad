import { createMyPluginFactory, ELEMENT_PLOT } from '@decipad/editor-types';
import { createEventInterceptorPluginFactory } from '../../pluginFactories';
import { lazyElementComponent } from '../../utils/lazyElement';

const LazyPlot = lazyElementComponent(() => import('./Plot'));

export const createPlotPlugin = createMyPluginFactory({
  key: ELEMENT_PLOT,
  isElement: true,
  component: LazyPlot,
  plugins: [
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_PLOT',
      elementTypes: [ELEMENT_PLOT],
      interceptor: () => {
        return true;
      },
    })(),
  ],
});
