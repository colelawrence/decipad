import {
  createMyPluginFactory,
  ELEMENT_INTEGRATION,
} from '@decipad/editor-types';
import { createEventInterceptorPluginFactory } from '@decipad/editor-plugins';
import { IntegrationBlock } from '../integration';
import { createNormalizeIntegrationBlock } from './createIntegrationBlockNormalizer';

export const createIntegrationPlugin = createMyPluginFactory({
  key: ELEMENT_INTEGRATION,
  isElement: true,
  component: IntegrationBlock,
  plugins: [
    createNormalizeIntegrationBlock,
    // Intercept events
    createEventInterceptorPluginFactory({
      name: 'INTERCEPTOR_INTEGRATION_BLOCK_PLUGIN',
      elementTypes: [ELEMENT_INTEGRATION],
      interceptor: () => {
        return true;
      },
    })(),
  ],
});
