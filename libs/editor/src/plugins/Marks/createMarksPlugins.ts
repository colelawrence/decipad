import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
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

const inlineCodePlugin = (): PlatePlugin => ({
  ...createCodePlugin(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_CODE),
});

export const createMarksPlugins = (): PlatePlugin[] => [
  boldPlugin(),
  italicPlugin(),
  underlinePlugin(),
  inlineCodePlugin(),
];
