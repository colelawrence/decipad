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
import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';
import { createAutoPairsPlugin } from '../plugins/AutoPairs/createAutoPairsPlugin';
import { createCodeVariableHighlightingPlugin } from '../plugins/CodeVariableHighlighting/createCodeVariableHighlightingPlugin';
import { createSentryBreadcrumbsPlugin } from '../plugins/SentryBreadcrumbsPlugin/createSentryBreadcrumbsPlugin';
import { createMarksPlugins } from '../plugins/Marks/createMarksPlugins';
import { createLinkPlugin } from '../plugins/Link/createLinkPlugin';
import { createNormalizeCodeBlockPlugin } from '../plugins/NormalizeCodeBlock/createNormalizeCodeBlockPlugin';
import { createSoftBreakPlugin } from '../plugins/SoftBreakPlugin/createSoftBreakPlugin';
import { createNormalizeEditorPlugin } from '../plugins/NormalizeEditor/createNormalizeEditorPlugin';
import { createNormalizeRichTextBlockPlugin } from '../plugins/NormalizeRichTextBlock/createNormalizeRichTextBlockPlugin';
import { createNormalizePlainTextBlockPlugin } from '../plugins/NormalizePlainTextBlock/createNormalizePlainTextBlockPlugin';
import { createNormalizeTextPlugin } from '../plugins/NormalizeText/createNormalizeTextPlugin';
import { createNormalizeListPlugin } from '../plugins/NormalizeListPlugin/createNormalizeListPlugin';
import { createNormalizeVoidPlugin } from '../plugins/NormalizeVoidPlugin/createNormalizeVoidPlugin';
import { createNormalizeLinkPlugin } from '../plugins/NormalizeLinkPlugin/createNormalizeLinkPlugin';
import { createNormalizeElementIdPlugin } from '../plugins/NormalizeElementId/createNormalizeElementIdPlugin';
import { createAutoFormatCodeBlockPlugin } from '../plugins/AutoFormatCodeBlock/createAutoFormatCodeBlockPlugin';
import { createPlotPlugin } from '../plugins/Plot/createPlotPlugin';

export const plugins = [
  // fundamentals
  createReactPlugin(),
  createHistoryPlugin(),

  // Sentry plugin
  createSentryBreadcrumbsPlugin(),

  // basic blocks
  createParagraphPlugin(),
  createBlockquotePlugin(),
  createHeadingPlugin({ levels: 3 }),
  createListPlugin(),

  // custom blocks
  createCodeBlockPlugin(),
  createPlotPlugin(),

  // structure enforcement
  createNormalizeEditorPlugin(),

  createNormalizeVoidPlugin(),

  createNormalizeRichTextBlockPlugin(),
  createNormalizePlainTextBlockPlugin(),
  createNormalizeCodeBlockPlugin(),
  createNormalizeListPlugin(),

  createNormalizeLinkPlugin(),

  createNodeIdPlugin({ idCreator: nanoid }),
  createNormalizeElementIdPlugin(),
  createNormalizeTextPlugin(),

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
  createAutoFormatCodeBlockPlugin(),

  // code editing
  createCodeVariableHighlightingPlugin(),
  createAutoPairsPlugin(),
];
