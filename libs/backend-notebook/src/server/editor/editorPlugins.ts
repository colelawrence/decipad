import type { MyPlatePlugin } from '@decipad/editor-types';
import type { Computer } from '@decipad/computer-interfaces';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createTablePluginNoUI } from '../../../../editor-table/src/plugins/createTablePluginNoUI';
import { createSmartRefPluginNoUI } from '../../../../editor-plugins/src/plugins/SmartRef/createSmartRefPluginNoUI';
import { createMagicNumberPluginNoUI } from '../../../../editor-plugins/src/plugins/MagicNumber/createMagicNumberPluginNoUI';
import { createCodeLineV2NoUiPlugin } from '../../../../editor-plugin-factories/src/shared-plugins/CodeLineV2/createCodeLineV2NoUiPlugin';

interface EditorPluginsOptions {
  computer: Computer;
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
