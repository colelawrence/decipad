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
import { createNormalizeCodeBlockPlugin } from '../plugins/NormalizeCodeBlock/createNormalizeCodeBlockPlugin';
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';
import { createSoftBreakPlugin } from '../plugins/createSoftBreakPlugin/createSoftBreakPlugin';

export const plugins = [
  // fundamentals
  createReactPlugin(),
  createHistoryPlugin(),

  // basic blocks
  createParagraphPlugin(),
  createBlockquotePlugin(),
  createHeadingPlugin({ levels: 3 }),
  createListPlugin(),

  // needed for the language integration
  createNodeIdPlugin({ idCreator: nanoid }),

  // custom blocks
  createInteractiveTablePlugin(),
  createCodeBlockPlugin(),

  // structure enforcement
  createForcedLayoutPlugin(),
  createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),

  // block manipulation
  createExitBreakPlugin(exitBreakOptions),
  createSoftBreakPlugin(),
  createResetNodePlugin(resetBlockTypeOptions),
  createDndPlugin(),

  // creating elements
  ...createMarksPlugins(),
  createAutoformatPlugin(autoformatRules),
  createLinkPlugin(),

  // code editing
  createNormalizeCodeBlockPlugin(),
  createCodeVariableHighlightingPlugin(),
  createAutoPairsPlugin(),
];
