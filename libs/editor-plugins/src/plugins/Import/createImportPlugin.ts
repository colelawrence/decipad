import { ELEMENT_IMPORT } from '@decipad/editor-types';
import type { UserInteraction } from '@decipad/react-contexts';
import type { PlatePlugin } from '@udecode/plate';
import { Subject } from 'rxjs';
import { lazyElementComponent } from '../../utils/lazyElement';
import { withImportOverrides } from './withImportOverrides';

const LazyImport = lazyElementComponent(
  () => import(/* webpackChunkName: "editor-import" */ './Import')
);

export const createImportPlugin = (
  interactions?: Subject<UserInteraction>
): PlatePlugin => ({
  key: ELEMENT_IMPORT,
  isElement: true,
  component: LazyImport,
  withOverrides: withImportOverrides(interactions),
});
