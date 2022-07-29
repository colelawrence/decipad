import { createTPluginFactory } from '@decipad/editor-types';

const logsColor = `
  color: green;
`;

export const createOperationsBlackboxPlugin = createTPluginFactory({
  key: 'OPERATIONS_BLACKBOX_PLUGIN',
  withOverrides: (editor) => {
    const { apply } = editor;

    // eslint-disable-next-line no-console
    console.debug('%cInitial Document:', logsColor, editor.children);

    // eslint-disable-next-line no-param-reassign
    editor.apply = (operation) => {
      const { type } = operation;

      // eslint-disable-next-line no-console
      console.debug(`%c${type}`, logsColor, operation);

      return apply(operation);
    };

    return editor;
  },
});
