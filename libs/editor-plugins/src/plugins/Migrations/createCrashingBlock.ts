import { CrashingLiveConnection } from '@decipad/editor-components';
import {
  ELEMENT_LIVE_CONNECTION,
  createMyPluginFactory,
} from '@decipad/editor-types';

export const createCrashingBlock = createMyPluginFactory({
  key: ELEMENT_LIVE_CONNECTION,
  isElement: true,
  component: CrashingLiveConnection,
});
