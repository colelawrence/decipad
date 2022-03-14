import { plugins as deciPlatePlugins } from '@decipad/editor-config';
import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
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
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { createCodeVariableHighlightingPlugin } from '../plugins/CodeVariableHighlighting/createCodeVariableHighlightingPlugin';
import { createMarksPlugins } from '../plugins/Marks/createMarksPlugins';
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';

export const plugins = [
  // fundamentals
  createReactPlugin(),
  createHistoryPlugin(),

  // Sentry plugin
  deciPlatePlugins.createSentryBreadcrumbsPlugin(),

  // basic blocks
  createParagraphPlugin(),
  createBlockquotePlugin(),
  createHeadingPlugin({ levels: 3 }),
  createListPlugin(),
  createCodeBlockPlugin(),

  // structure enforcement
  deciPlatePlugins.createNormalizeEditorPlugin(),

  deciPlatePlugins.createNormalizeVoidPlugin(),

  deciPlatePlugins.createNormalizeRichTextBlockPlugin(),
  deciPlatePlugins.createNormalizePlainTextBlockPlugin(),
  deciPlatePlugins.createNormalizeCodeBlockPlugin(),
  deciPlatePlugins.createNormalizeListPlugin(),

  deciPlatePlugins.createNormalizeLinkPlugin(),

  createNodeIdPlugin({ idCreator: nanoid }),
  deciPlatePlugins.createNormalizeElementIdPlugin(),
  deciPlatePlugins.createNormalizeTextPlugin(),

  createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),

  // block manipulation
  createExitBreakPlugin(exitBreakOptions),
  deciPlatePlugins.createSoftBreakPlugin(),
  createResetNodePlugin(resetBlockTypeOptions),
  createDndPlugin(),

  // creating elements
  ...createMarksPlugins(),
  createAutoformatPlugin(autoformatRules),
  deciPlatePlugins.createLinkPlugin(),
  deciPlatePlugins.createAutoFormatCodeBlockPlugin(),

  // code editing
  createCodeVariableHighlightingPlugin(),
  deciPlatePlugins.createAutoPairsPlugin(),
];
