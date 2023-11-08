import { MyPlatePlugin } from '@decipad/editor-types';
import type { RemoteComputer } from '@decipad/remote-computer';
import { createTablePlugin } from '@decipad/editor-table';
import { createDeserializeMdPlugin } from '@udecode/plate';
import { createCodeLineV2Plugin } from '@decipad/editor-plugins';

interface EditorPluginsOptions {
  computer: RemoteComputer;
}

export const editorPlugins = ({
  computer,
}: EditorPluginsOptions): MyPlatePlugin[] => [
  createTablePlugin(computer),
  createDeserializeMdPlugin() as MyPlatePlugin,
  createCodeLineV2Plugin(computer),
];
