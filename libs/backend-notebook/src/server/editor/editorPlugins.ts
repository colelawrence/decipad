import { MyPlatePlugin } from '@decipad/editor-types';
import type { RemoteComputer } from '@decipad/remote-computer';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createCodeLineV2NoUiPlugin } from '../../../../editor-plugins/src/plugins/CodeLineV2/createCodeLineV2NoUiPlugin';
import { createTablePluginNoUI } from '../../../../editor-table/src/plugins/createTablePluginNoUI';

interface EditorPluginsOptions {
  computer: RemoteComputer;
}

export const editorPlugins = ({
  computer,
}: EditorPluginsOptions): MyPlatePlugin[] => [
  createTablePluginNoUI(computer),
  createDeserializeMdPlugin() as MyPlatePlugin,
  createCodeLineV2NoUiPlugin(computer),
];
