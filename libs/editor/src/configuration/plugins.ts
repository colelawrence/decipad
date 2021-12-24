import {
  createAutoformatPlugin,
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createDndPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createListPlugin,
  createNodeIdPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createTrailingBlockPlugin,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { createAutoPairsPlugin } from '../plugins/AutoPairs/createAutoPairsPlugin';
import { createCodeVariableHighlightingPlugin } from '../plugins/CodeVariableHighlighting/createCodeVariableHighlightingPlugin';
import { createForcedLayoutPlugin } from '../plugins/ForcedLayout/createForcedLayoutPlugin';
import { createInteractiveTablePlugin } from '../plugins/InteractiveTable/createInteractiveTablePlugin';
import { createMarksPlugins } from '../plugins/Marks/createMarksPlugins';
import { createLinkPlugin } from '../plugins/Link/createLinkPlugin';
import { createNormalizeCodePlugin } from '../plugins/NormalizeCode/createNormalizeCodePlugin';
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';
import { softBreakOptions } from './softBreakOptions';

export const plugins = [
  // fundamentals
  createReactPlugin(),
  createHistoryPlugin(),

  // basic blocks
  createParagraphPlugin(),
  createBlockquotePlugin(),
  createHeadingPlugin({ levels: 3 }),
  createListPlugin(),

  // custom blocks
  createInteractiveTablePlugin(),
  createCodeBlockPlugin(),

  // structure enforcement
  createForcedLayoutPlugin(),
  createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),

  // block manipulation
  createExitBreakPlugin(exitBreakOptions),
  createSoftBreakPlugin(softBreakOptions),
  createResetNodePlugin(resetBlockTypeOptions),
  createDndPlugin(),

  // creating elements
  ...createMarksPlugins(),
  createAutoformatPlugin(autoformatRules),
  createLinkPlugin(),

  // code editing
  createNormalizeCodePlugin(),
  createCodeVariableHighlightingPlugin(),
  createAutoPairsPlugin(),

  // needed for the language integration
  createNodeIdPlugin({ idCreator: nanoid }),
];
