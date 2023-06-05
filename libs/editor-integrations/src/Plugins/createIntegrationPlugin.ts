import {
  ELEMENT_INTEGRATION,
  createTPluginFactory,
} from '@decipad/editor-types';
import { IntegrationBlock } from '../Integration';

export const createIntegrationPlugin = createTPluginFactory({
  key: ELEMENT_INTEGRATION,
  isElement: true,
  component: IntegrationBlock,
});
