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
  createLinkPlugin,
  createCodeBlockPlugin,
  createCodeVariableHighlightPlugin,
  createSyntaxErrorHighlightPlugin,
  createLayoutColumnsPlugin,
  createPlotPlugin,
  createCalloutPlugin,
  createDividerPlugin,
  createEditorApplyErrorReporterPlugin,
  createCodeLinePlugin,
  createCursorsPlugin,
  createUpdateComputerPlugin,
} from '@decipad/editor-plugins';
import { createTablePlugin } from '@decipad/editor-table';
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
import { Computer } from '@decipad/computer';
import { createVariableDefPlugin } from '@decipad/editor-variable-def';
import { components } from './components';
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';

export const plugins = (computer: Computer): ReturnType<typeof createPlugins> =>
  createPlugins(
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

      // code editing
      createCodeBlockPlugin(),
      createCodeVariableHighlightPlugin(),
      createSyntaxErrorHighlightPlugin(),
      createAutoPairsPlugin(),

      // language
      createCodeLinePlugin(computer),
      createCursorsPlugin(computer),
      createUpdateComputerPlugin(computer),
      createVariableDefPlugin(computer),

      // tables
      createTablePlugin(),

      // plots
      createPlotPlugin(),

      // error handling
      createEditorApplyErrorReporterPlugin(),
    ],
    {
      components: components(computer),
    }
  );
