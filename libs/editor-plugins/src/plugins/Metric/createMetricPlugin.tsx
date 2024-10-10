import type { MetricElement } from '@decipad/editor-types';
import { createMyPluginFactory, ELEMENT_METRIC } from '@decipad/editor-types';
import { Metric } from '@decipad/editor-components';
import { nanoid } from 'nanoid';
import { createEventInterceptorPluginFactory } from '@decipad/editor-plugin-factories';

export const createMetricPlugin = createMyPluginFactory({
  key: ELEMENT_METRIC,
  isElement: true,
  isVoid: true,
  component: Metric,
  plugins: [
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_METRIC',
      elementTypes: [ELEMENT_METRIC],
      interceptor: () => {
        return true;
      },
    })(),
  ],
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'div',
      },
    ],
    getNode: (): MetricElement | undefined => {
      return {
        id: nanoid(),
        type: ELEMENT_METRIC,
        children: [{ text: '' }],
      };
    },
  },
  serializeHtml: ({ children }) => {
    return <div data-type="metric">{children}</div>;
  },
});
