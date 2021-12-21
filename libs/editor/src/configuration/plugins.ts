import {
  createAutoformatPlugin,
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createDndPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createKbdPlugin,
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
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';
import { softBreakOptions } from './softBreakOptions';
import { createAutoFormatCodePlugin } from '../plugins/AutoFormatCode/createAutoFormatCodePlugin';
import { createSplitAndMergeCodeStatementsPlugin } from '../plugins/SplitAndMergeCodeStatements/createSplitAndMergeCodeStatementsPlugin';

export const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),

  createParagraphPlugin(),
  createBlockquotePlugin(),
  createHeadingPlugin({ levels: 3 }),
  createCodeBlockPlugin(),

  createListPlugin(),
  createInteractiveTablePlugin(),

  ...createMarksPlugins(),

  createAutoPairsPlugin(),

  createExitBreakPlugin(exitBreakOptions),
  createSoftBreakPlugin(softBreakOptions),
  createResetNodePlugin(resetBlockTypeOptions),
  createAutoformatPlugin(autoformatRules),
  createCodeVariableHighlightingPlugin(),
  createDndPlugin(),

  createKbdPlugin(),
  createNodeIdPlugin({ idCreator: nanoid }),

  createForcedLayoutPlugin(),
  createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),
  createAutoFormatCodePlugin(),
  createSplitAndMergeCodeStatementsPlugin(),
];
