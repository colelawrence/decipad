import {
  createAutoformatPlugin,
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createDndPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createKbdPlugin,
  createNodeIdPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createTrailingBlockPlugin,
  ELEMENT_PARAGRAPH,
  WithAutoformatOptions,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { createBubblePlugin } from '../plugins/Bubbles/createBubblePlugin';
import { createForcedLayoutPlugin } from '../plugins/ForcedLayout/createForcedLayoutPlugin';
import { createMarksPlugins } from '../plugins/Marks/createMarksPlugins';
import { optionsAutoformat } from './autoFormatOptions';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';
import { softBreakOptions } from './softBreakOption';

export const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),

  createParagraphPlugin(),
  createBlockquotePlugin(),
  createHeadingPlugin({ levels: 3 }),
  createCodeBlockPlugin(),

  ...createMarksPlugins(),

  createExitBreakPlugin(exitBreakOptions),
  createSoftBreakPlugin(softBreakOptions),
  createResetNodePlugin(resetBlockTypeOptions),
  createAutoformatPlugin(optionsAutoformat as WithAutoformatOptions),
  createBubblePlugin(),
  createDndPlugin(),

  createKbdPlugin(),
  createNodeIdPlugin({ idCreator: nanoid }),

  createForcedLayoutPlugin(),
  createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),
];
