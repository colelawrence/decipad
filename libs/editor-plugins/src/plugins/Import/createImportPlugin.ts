import { ELEMENT_IMPORT } from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate';
import { lazyElementComponent } from '../../utils/lazyElement';
import { withImportOverrides } from './withImportOverrides';

const LazyImport = lazyElementComponent(
  () => import(/* webpackChunkName: "editor-import" */ './Import')
);

export const createImportPlugin = createPluginFactory({
  key: ELEMENT_IMPORT,
  isElement: true,
  component: LazyImport,
  withOverrides: withImportOverrides,
});
