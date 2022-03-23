import { createPluginFactory } from '@udecode/plate';
import { addBreadcrumb } from '@sentry/react';

export const createSentryBreadcrumbsPlugin = createPluginFactory({
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
