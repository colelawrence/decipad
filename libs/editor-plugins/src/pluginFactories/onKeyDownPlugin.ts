import {
  createPluginFactory,
  KeyboardHandler,
  PlatePlugin,
} from '@udecode/plate';

type OnKeyDownFactoryArgs = {
  name: string;
  plugin: KeyboardHandler;
};

export const createOnKeyDownPluginFactory = ({
  name,
  plugin,
}: OnKeyDownFactoryArgs): (() => PlatePlugin) =>
  createPluginFactory({
    key: name,
    handlers: {
      onKeyDown: plugin,
    },
  });
