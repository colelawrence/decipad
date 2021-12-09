import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  PlatePlugin,
} from '@udecode/plate';
import { allowsTextStyling } from '../../utils/block';
import { getPathContainingSelection } from '../../utils/selection';

const withHotkeyRestrictedToAllowedBlocks = (
  plugin: PlatePlugin
): PlatePlugin => ({
  ...plugin,
  onKeyDown:
    (editor) =>
    (...args) => {
      if (allowsTextStyling(editor, getPathContainingSelection(editor))) {
        return plugin.onKeyDown?.(editor)(...args);
      }
    },
});

const boldPlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createBoldPlugin());

const italicPlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createItalicPlugin());

const underlinePlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createUnderlinePlugin());

const strikethroughPlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createStrikethroughPlugin());

const inlineCodePlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createCodePlugin());

export const createMarksPlugins = (): PlatePlugin[] => [
  boldPlugin(),
  italicPlugin(),
  underlinePlugin(),
  inlineCodePlugin(),
  strikethroughPlugin(),
];
