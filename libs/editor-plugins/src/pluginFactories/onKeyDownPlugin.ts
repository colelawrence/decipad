import { createTPluginFactory, MyKeyboardHandler } from '@decipad/editor-types';

type OnKeyDownFactoryArgs = {
  name: string;
  plugin: MyKeyboardHandler;
};

export const createOnKeyDownPluginFactory = ({
  name,
  plugin,
}: OnKeyDownFactoryArgs) =>
  createTPluginFactory({
    key: name,
    handlers: {
      onKeyDown: plugin,
    },
  });
