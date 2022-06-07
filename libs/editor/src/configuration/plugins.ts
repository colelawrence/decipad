import {
  createAutoFormatCodeBlockPlugin,
  createAutoPairsPlugin,
  createCalloutPlugin,
  createCodeLinePlugin,
  createCodeVariableHighlightPlugin,
  createCursorsPlugin,
  createDividerPlugin,
  createEditorApplyErrorReporterPlugin,
  createLayoutColumnsPlugin,
  createLinkPlugin,
  createMarksPlugins,
  createNormalizeCodeBlockPlugin,
  createNormalizeCodeLinePlugin,
  createNormalizeColumnsPlugin,
  createNormalizeEditorPlugin,
  createNormalizeElementIdPlugin,
  createNormalizeLinkPlugin,
  createNormalizeListPlugin,
  createNormalizePlainTextBlockPlugin,
  createNormalizeRichTextBlockPlugin,
  createNormalizeTextPlugin,
  createNormalizeVoidPlugin,
  createPlotPlugin,
  createOperationsBlackboxPlugin,
  createSoftBreakPlugin,
  createSyntaxErrorHighlightPlugin,
  createUpdateComputerPlugin,
} from '@decipad/editor-plugins';
import { createTablePlugin } from '@decipad/editor-table';
import {
  createTAutoformatPlugin,
  ELEMENT_PARAGRAPH,
  MyEditor,
  MyValue,
} from '@decipad/editor-types';
import {
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
import { createPowerTablePlugin } from '@decipad/editor-power-table';
import { components } from './components';
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';

export const plugins = (computer: Computer) =>
  createPlugins<MyValue, MyEditor>(
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(createMarksPlugins() as any[]),
      createLinkPlugin(),
      createTAutoformatPlugin({
        options: { rules: autoformatRules },
      }),
      createAutoFormatCodeBlockPlugin(),

      // code editing
      createCodeVariableHighlightPlugin(),
      createSyntaxErrorHighlightPlugin(),
      createAutoPairsPlugin(),

      // language
      createCodeLinePlugin(computer),
      createCursorsPlugin(computer),
      createUpdateComputerPlugin(computer),
      createVariableDefPlugin(computer),

      // tables
      createTablePlugin(computer),
      createPowerTablePlugin(),

      // plots
      createPlotPlugin(),

      // error handling
      createEditorApplyErrorReporterPlugin(),
      createOperationsBlackboxPlugin(),
    ],
    {
      components: components(computer),
    }
  );
