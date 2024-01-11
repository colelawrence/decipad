import { createTPluginFactory, ELEMENT_MATH } from '@decipad/editor-types';
import { lazyElementComponent } from '../../utils/lazyElement';

const LazyMath = lazyElementComponent(() => import('./Math'));

export const createMathPlugin = createTPluginFactory({
  key: ELEMENT_MATH,
  isElement: true,
  isVoid: true,
  component: LazyMath,
});
