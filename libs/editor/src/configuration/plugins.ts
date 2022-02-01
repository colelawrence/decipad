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
import { ELEMENT_PARAGRAPH } from '../elements';
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';
import { createAutoPairsPlugin } from '../plugins/AutoPairs/createAutoPairsPlugin';
import { createCodeVariableHighlightingPlugin } from '../plugins/CodeVariableHighlighting/createCodeVariableHighlightingPlugin';
import { createInteractiveTablePlugin } from '../plugins/InteractiveTable/createInteractiveTablePlugin';
import { createSentryBreadcrumbsPlugin } from '../plugins/SentryBreadcrumbsPlugin/createSentryBreadcrumbsPlugin';
import { createMarksPlugins } from '../plugins/Marks/createMarksPlugins';
import { createLinkPlugin } from '../plugins/Link/createLinkPlugin';
import { createNormalizeCodeBlockPlugin } from '../plugins/NormalizeCodeBlock/createNormalizeCodeBlockPlugin';
import { createSoftBreakPlugin } from '../plugins/SoftBreakPlugin/createSoftBreakPlugin';
import { createNormalizeEditorPlugin } from '../plugins/NormalizeEditor/createNormalizeEditorPlugin';
import { createNormalizeRichTextBlockPlugin } from '../plugins/NormalizeRichTextBlock/createNormalizeRichTextBlockPlugin';
import { createNormalizePlainTextBlockPlugin } from '../plugins/NormalizePlainTextBlock/createNormalizePlainTextBlockPlugin';
import { createNormalizeTextPlugin } from '../plugins/NormalizeText/createNormalizeTextPlugin';

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

  // needed for the language integration
  createNodeIdPlugin({ idCreator: nanoid }),

  // custom blocks
  createInteractiveTablePlugin(),
  createCodeBlockPlugin(),

  // structure enforcement
  createNormalizeEditorPlugin(),

  // TODO void block plugin (table/fetch)

  createNormalizeRichTextBlockPlugin(),
  createNormalizePlainTextBlockPlugin(),
  createNormalizeCodeBlockPlugin(),
  // TODO NormalizeListPlugin

  // TODO NormalizeLinkPlugin for props and only rich text

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

  // code editing
  createCodeVariableHighlightingPlugin(),
  createAutoPairsPlugin(),
];
