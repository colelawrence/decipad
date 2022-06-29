import {
  createAutoCompleteMenuPlugin,
  createAutoFormatCodeBlockPlugin,
  createAutoPairsPlugin,
  createCalloutPlugin,
  createCodeLinePlugin,
  createCodeVariableHighlightPlugin,
  createCursorsPlugin,
  createDecorateUserParseErrorsPlugin,
  createDividerPlugin,
  createDragOverCursorPlugin,
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
  createOperationsBlackboxPlugin,
  createPlotPlugin,
  createSoftBreakPlugin,
  createSyntaxErrorHighlightPlugin,
  createUpdateComputerPlugin,
  createUniqueElementIdPlugin,
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
  createDeserializeDocxPlugin,
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
import { createJuicePlugin } from '@udecode/plate-juice';
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
      createNodeIdPlugin({ options: { idCreator: nanoid } }),

      // block manipulation
      createExitBreakPlugin({ options: exitBreakOptions }),
      createSoftBreakPlugin(),
      createResetNodePlugin({ options: resetBlockTypeOptions }),
      createDndPlugin(),
      createDragOverCursorPlugin(),

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
      createAutoCompleteMenuPlugin(),
      createSyntaxErrorHighlightPlugin(),
      createAutoPairsPlugin(),

      // user parse errors
      createDecorateUserParseErrorsPlugin(computer),

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

      // deserializers
      createDeserializeDocxPlugin(),
      createJuicePlugin(),

      // id uniqueness
      createUniqueElementIdPlugin(),
    ],
    {
      components: components(computer),
    }
  );
