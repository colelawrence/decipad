import {
  createAutoformatPlugin,
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createDndPlugin,
  createExitBreakPlugin,
  createHistoryPlugin,
  createKbdPlugin,
  createNodeIdPlugin,
  createNormalizeTypesPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createTrailingBlockPlugin,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  WithAutoformatOptions,
} from '@udecode/plate';
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

  createExitBreakPlugin(exitBreakOptions),
  createSoftBreakPlugin(softBreakOptions),
  createResetNodePlugin(resetBlockTypeOptions),
  createAutoformatPlugin(optionsAutoformat as WithAutoformatOptions),
  createBubblePlugin(),
  createDndPlugin(),

  createKbdPlugin(),
  createNodeIdPlugin({ idCreator: nanoid }),

  createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),
  createNormalizeTypesPlugin({
    rules: [{ path: [0], strictType: ELEMENT_H1 }],
  }),
];
