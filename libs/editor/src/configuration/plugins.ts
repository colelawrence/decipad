import {
  createNormalizeEditorPlugin,
  createNormalizeVoidPlugin,
  createNormalizeRichTextBlockPlugin,
  createNormalizePlainTextBlockPlugin,
  createNormalizeCodeBlockPlugin,
  createNormalizeCodeLinePlugin,
  createNormalizeColumnsPlugin,
  createNormalizeListPlugin,
  createNormalizeLinkPlugin,
  createNormalizeElementIdPlugin,
  createNormalizeTextPlugin,
  createSoftBreakPlugin,
  createMarksPlugins,
  createAutoFormatCodeBlockPlugin,
  createAutoPairsPlugin,
  createInteractiveTablePlugin,
  createLinkPlugin,
  createCodeBlockPlugin,
  createCodeVariableHighlightPlugin,
  createSyntaxErrorHighlightPlugin,
  createLayoutColumnsPlugin,
  createPlotPlugin,
  createCalloutPlugin,
  createDividerPlugin,
  createEditorApplyErrorReporterPlugin,
} from '@decipad/editor-plugins';
import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import {
  createAutoformatPlugin,
  createBlockquotePlugin,
  createDndPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createListPlugin,
  createNodeIdPlugin,
  createParagraphPlugin,
  createPlugins,
  createResetNodePlugin,
  createTrailingBlockPlugin,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { components } from './components';
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';

export const plugins = createPlugins(
  [
    // basic blocks
    createParagraphPlugin(),
    createBlockquotePlugin(),
    createHeadingPlugin({ options: { levels: 3 } }),
    createListPlugin(),
    createCalloutPlugin(),
    createDividerPlugin(),

    // Layout blocks
    createLayoutColumnsPlugin(),

    // structure enforcement
    createNodeIdPlugin({ options: { idCreator: nanoid } }),
    createNormalizeEditorPlugin(),
    createNormalizeVoidPlugin(),
    createNormalizeRichTextBlockPlugin(),
    createNormalizePlainTextBlockPlugin(),
    createNormalizeCodeBlockPlugin(),
    createNormalizeCodeLinePlugin(),
    createNormalizeListPlugin(),
    createNormalizeLinkPlugin(),
    createNormalizeElementIdPlugin(),
    createNormalizeTextPlugin(),
    createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),
    createNormalizeColumnsPlugin(),

    // block manipulation
    createExitBreakPlugin({ options: exitBreakOptions }),
    createSoftBreakPlugin(),
    createResetNodePlugin({ options: resetBlockTypeOptions }),
    createDndPlugin(),

    // creating elements
    ...createMarksPlugins(),
    createLinkPlugin(),
    createAutoformatPlugin({ options: { rules: autoformatRules } }),
    createAutoFormatCodeBlockPlugin(),
    createCodeBlockPlugin(),

    // code editing
    createCodeVariableHighlightPlugin(),
    createSyntaxErrorHighlightPlugin(),
    createAutoPairsPlugin(),

    // inputs
    createInteractiveTablePlugin(),

    // plots
    createPlotPlugin(),

    // error handling
    createEditorApplyErrorReporterPlugin(),
  ],
  {
    components,
  }
);
