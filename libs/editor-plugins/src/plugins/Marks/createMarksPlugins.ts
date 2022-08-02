import {
  allowsTextStyling,
  getPathContainingSelection,
} from '@decipad/editor-utils';
import {
  createBoldPlugin,
  createCodePlugin,
  createHighlightPlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  WithRequired,
} from '@udecode/plate';
import { MyPlatePlugin } from '@decipad/editor-types';
import { isEnabled } from '@decipad/feature-flags';
import {
  createMagicNumberPlugin,
  createValueBubblePlugin,
} from '../MagicNumber';

export type StrictPlugin = WithRequired<
  MyPlatePlugin,
  'type' | 'options' | 'inject' | 'editor'
>;

const withHotkeyRestrictedToAllowedBlocks = (
  plugin: StrictPlugin
): StrictPlugin => ({
  ...plugin,
  handlers: {
    onKeyDown:
      (editor, pi) =>
      (...args) => {
        if (
          plugin.handlers?.onKeyDown &&
          allowsTextStyling(editor, getPathContainingSelection(editor))
        ) {
          return plugin.handlers?.onKeyDown?.(editor, pi)(...args);
        }
      },
  },
});

const boldPlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createBoldPlugin() as StrictPlugin);

const italicPlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createItalicPlugin() as StrictPlugin);

const underlinePlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createUnderlinePlugin() as StrictPlugin);

const strikethroughPlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(
    createStrikethroughPlugin() as StrictPlugin
  );

const inlineCodePlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createCodePlugin() as StrictPlugin);

const highlightPlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(createHighlightPlugin() as StrictPlugin);

const magicNumberPlugin = () =>
  withHotkeyRestrictedToAllowedBlocks(
    createMagicNumberPlugin() as StrictPlugin
  );

const valueBubblePlugin = () =>
  !isEnabled('INLINE_BUBBLES')
    ? []
    : [
        withHotkeyRestrictedToAllowedBlocks(
          createValueBubblePlugin() as StrictPlugin
        ),
      ];

export const createMarksPlugins = (): StrictPlugin[] => [
  boldPlugin(),
  italicPlugin(),
  underlinePlugin(),
  inlineCodePlugin(),
  strikethroughPlugin(),
  highlightPlugin(),
  magicNumberPlugin(),
  ...valueBubblePlugin(),
];
