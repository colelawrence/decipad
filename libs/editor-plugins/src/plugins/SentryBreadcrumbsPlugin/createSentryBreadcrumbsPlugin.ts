import { addBreadcrumb } from '@sentry/react';
import { createOverrideApplyPluginFactory } from '../../pluginFactories';

export const createSentryBreadcrumbsPlugin = createOverrideApplyPluginFactory({
  name: 'SENTRY_BREADCRUMBS_PLUGIN',
  plugin: (_, apply) => (operation) => {
    addBreadcrumb({
      message: 'Slate operation',
      data: { operation },
      timestamp: Date.now(),
    });
    apply(operation);
  },
});
