import {
  createAlignPlugin,
  createAutoformatPlugin,
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createExitBreakPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createKbdPlugin,
  createListPlugin,
  createNodeIdPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createTodoListPlugin,
  createTrailingBlockPlugin,
  ELEMENT_PARAGRAPH,
  WithAutoformatOptions,
} from '@udecode/slate-plugins';
import { nanoid } from 'nanoid';
import { optionsAutoformat } from './autoFormatOptions';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';
import { softBreakOptions } from './softBreakOption';

export const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),

  ...createBasicElementPlugins({ heading: { levels: 3 } }),
  ...createBasicMarkPlugins(),
  createListPlugin(),
  createTodoListPlugin(),

  createAlignPlugin(),

  createExitBreakPlugin(exitBreakOptions),
  createSoftBreakPlugin(softBreakOptions),
  createResetNodePlugin(resetBlockTypeOptions),
  createAutoformatPlugin(optionsAutoformat as WithAutoformatOptions),
  createImagePlugin(),

  createKbdPlugin(),
  createNodeIdPlugin({ idCreator: nanoid }),

  createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),
];
