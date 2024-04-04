import type { MyPlatePlugin } from '@decipad/editor-types';
import type { RemoteComputer } from '@decipad/remote-computer';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createCodeLineV2NoUiPlugin } from '../../../../editor-plugins/src/plugins/CodeLineV2/createCodeLineV2NoUiPlugin';
import { createTablePluginNoUI } from '../../../../editor-table/src/plugins/createTablePluginNoUI';
import { createSmartRefPluginNoUI } from '../../../../editor-plugins/src/plugins/SmartRef/createSmartRefPluginNoUI';
import { createMagicNumberPluginNoUI } from '../../../../editor-plugins/src/plugins/MagicNumber/createMagicNumberPluginNoUI';

interface EditorPluginsOptions {
  computer: RemoteComputer;
}

export const editorPlugins = ({
  computer,
}: EditorPluginsOptions): MyPlatePlugin[] => [
  createTablePluginNoUI(computer),
  createDeserializeMdPlugin() as MyPlatePlugin,
  createCodeLineV2NoUiPlugin(computer),
  createSmartRefPluginNoUI(),
  createMagicNumberPluginNoUI(),
];
