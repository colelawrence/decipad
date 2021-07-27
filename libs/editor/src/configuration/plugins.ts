import {
  createAlignPlugin,
  createAutoformatPlugin,
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createDndPlugin,
  createExitBreakPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createKbdPlugin,
  createListPlugin,
  createNodeIdPlugin,
  createNormalizeTypesPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createTodoListPlugin,
  createTrailingBlockPlugin,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  WithAutoformatOptions,
} from '@udecode/slate-plugins';
import { nanoid } from 'nanoid';
import { createBubblePlugin } from '../plugins/Bubbles/createBubblePlugin';
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
  createBubblePlugin(),
  createDndPlugin(),

  createKbdPlugin(),
  createNodeIdPlugin({ idCreator: nanoid }),

  createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),
  createNormalizeTypesPlugin({
    rules: [{ path: [0], strictType: ELEMENT_H1 }],
  }),
];
