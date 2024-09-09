import { isServerSideRendering } from '@decipad/support';
import { createOverrideApplyPluginFactory } from '@decipad/editor-plugin-factories';

const logsColor = `
  color: green;
`;

export const createOperationsBlackboxPlugin = createOverrideApplyPluginFactory({
  name: 'OPERATIONS_BLACKBOX_PLUGIN',
  plugin: (editor, apply) => {
    if (
      (process.env.NODE_ENV === 'test' && !process.env.DEBUG) ||
      process.env.VITEST_WORKER_ID ||
      process.env.VITEST ||
      isServerSideRendering()
    ) {
      return apply;
    }
    // eslint-disable-next-line no-console
    console.debug('%cInitial Document:', logsColor, editor.children);

    // eslint-disable-next-line no-param-reassign
    return (operation) => {
      const { type } = operation;

      // eslint-disable-next-line no-console
      console.debug(`%c${type}`, logsColor, operation);

      return apply(operation);
    };
  },
});
