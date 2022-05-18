import { addBreadcrumb } from '@sentry/react';
import { createTPluginFactory } from '@decipad/editor-types';

export const createSentryBreadcrumbsPlugin = createTPluginFactory({
  key: 'SENTRY_BREADCRUMBS_PLUGIN',
  withOverrides: (editor) => {
    const { apply } = editor;

    // eslint-disable-next-line no-param-reassign
    editor.apply = (operation) => {
      addBreadcrumb({
        message: 'Slate operation',
        data: { operation },
        timestamp: Date.now(),
      });

      return apply(operation);
    };

    return editor;
  },
});
