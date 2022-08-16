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
  createEvalPlugin,
  createImagePlugin,
  createImportPlugin,
  createLayoutColumnsPlugin,
  createLinkPlugin,
  createMarksPlugins,
  createMediaEmbedPlugin,
  createNormalizeCodeBlockPlugin,
  createNormalizeCodeLinePlugin,
  createNormalizeColumnsPlugin,
  createNormalizeEditorPlugin,
  createNormalizeElementIdPlugin,
  createNormalizeImagePlugin,
  createNormalizeLinkPlugin,
  createNormalizeListPlugin,
  createNormalizeNewParagraphPlugin,
  createNormalizePlainTextBlockPlugin,
  createNormalizeRichTextBlockPlugin,
  createNormalizeTextPlugin,
  createNormalizeVoidPlugin,
  createOperationsBlackboxPlugin,
  createPlotPlugin,
  createSoftBreakPlugin,
  createSyntaxErrorHighlightPlugin,
  createTabIndentPlugin,
  createUniqueElementIdPlugin,
  createUpdateComputerPlugin,
  createWithDocSyncHistoryPlugin,
} from '@decipad/editor-plugins';
import { createTablePlugin } from '@decipad/editor-table';
import {
  createTAutoformatPlugin,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
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
  createSelectOnBackspacePlugin,
  createTrailingBlockPlugin,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Computer } from '@decipad/computer';
import { createVariableDefPlugin } from '@decipad/editor-variable-def';
import { createDataViewPlugin } from '@decipad/editor-data-view';
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
      createNormalizeImagePlugin(),
      createNormalizeElementIdPlugin(),
      createNormalizeTextPlugin(),
      createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),
      createNormalizeColumnsPlugin(),
      createNodeIdPlugin({ options: { idCreator: nanoid, reuseId: true } }),

      // block manipulation
      createExitBreakPlugin({ options: exitBreakOptions }),
      createSoftBreakPlugin(),
      createResetNodePlugin({ options: resetBlockTypeOptions }),
      createDndPlugin(),
      createDragOverCursorPlugin(),

      // media elements
      createSelectOnBackspacePlugin({
        options: {
          query: {
            allow: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED],
          },
        },
      }),

      // creating elements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(createMarksPlugins() as any[]),
      createLinkPlugin(),
      createImagePlugin(),
      createMediaEmbedPlugin(),
      createTAutoformatPlugin({
        options: { rules: autoformatRules },
      }),
      createAutoFormatCodeBlockPlugin(),
      createImportPlugin(),

      // code editing
      createCodeVariableHighlightPlugin(),
      createAutoCompleteMenuPlugin(),
      createSyntaxErrorHighlightPlugin(),
      createAutoPairsPlugin(),
      createTabIndentPlugin(),

      // user parse errors
      createDecorateUserParseErrorsPlugin(computer),

      // language
      ...createEvalPlugin(computer),
      createCodeLinePlugin(computer),
      createCursorsPlugin(computer),
      createUpdateComputerPlugin(computer),
      createVariableDefPlugin(computer),

      // tables
      createTablePlugin(computer),
      createDataViewPlugin(),

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

      // history
      createWithDocSyncHistoryPlugin(),

      createNormalizeNewParagraphPlugin(),
    ],
    {
      components: components(computer),
    }
  );
