import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  PlatePlugin,
} from '@udecode/plate';
import { getToggleMarkOnKeyDown } from '../../utils/getToggleMarkOnKeyDown';

const boldPlugin = (): PlatePlugin => ({
  ...createBoldPlugin(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_BOLD),
});

const italicPlugin = (): PlatePlugin => ({
  ...createItalicPlugin(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_ITALIC),
});

const underlinePlugin = (): PlatePlugin => ({
  ...createUnderlinePlugin(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_UNDERLINE),
});

const strikethroughPlugin = (): PlatePlugin => ({
  ...createStrikethroughPlugin(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_STRIKETHROUGH),
});

const inlineCodePlugin = (): PlatePlugin => ({
  ...createCodePlugin(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_CODE),
});

export const createMarksPlugins = (): PlatePlugin[] => [
  boldPlugin(),
  italicPlugin(),
  underlinePlugin(),
  inlineCodePlugin(),
  strikethroughPlugin(),
];
