import {
  createMyPluginFactory,
  ELEMENT_INTEGRATION,
} from '@decipad/editor-types';
import { createEventInterceptorPluginFactory } from '@decipad/editor-plugin-factories';
import { IntegrationBlock } from '../integration';

export const createIntegrationPlugin = createMyPluginFactory({
  key: ELEMENT_INTEGRATION,
  isElement: true,
  component: IntegrationBlock,
  plugins: [
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
