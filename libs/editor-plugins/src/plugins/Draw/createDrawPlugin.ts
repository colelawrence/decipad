import { createTPluginFactory, ELEMENT_DRAW } from '@decipad/editor-types';
import { lazyElementComponent } from '../../utils/lazyElement';

const LazyDraw = lazyElementComponent(
  () => import(/* webpackChunkName: "editor-draw" */ './Draw')
);

export const createDrawPlugin = createTPluginFactory({
  key: ELEMENT_DRAW,
  isElement: true,
  isVoid: true,
  component: LazyDraw,
});
