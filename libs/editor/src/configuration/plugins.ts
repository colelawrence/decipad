import {
  createAutoCompleteMenuPlugin,
  createAutoFormatCodeBlockPlugin,
  createAutoPairsPlugin,
  createCalloutPlugin,
  createCodeLinePlugin,
  createCodeVariableHighlightPlugin,
  createDividerPlugin,
  createDisplayPlugin,
  createDragOverCursorPlugin,
  createEditorApplyErrorReporterPlugin,
  createEvalPlugin,
  createImagePlugin,
  createImportPlugin,
  createLayoutColumnsPlugin,
  createLinkPlugin,
  createLiveConnectionPlugin,
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
  createNormalizePlainTextBlockPlugin,
  createNormalizeRichTextBlockPlugin,
  createNormalizeTextPlugin,
  createNormalizeVoidPlugin,
  createExitBreakPlugin,
  createOperationsBlackboxPlugin,
  createPlotPlugin,
  createSoftBreakPlugin,
  createSyntaxErrorHighlightPlugin,
  createNavigationPlugin,
  createUniqueElementIdPlugin,
  createUpdateComputerPlugin,
  createWithDocSyncHistoryPlugin,
  createTrailingParagraphPlugin,
} from '@decipad/editor-plugins';
import { createTablePlugin } from '@decipad/editor-table';
import {
  createTAutoformatPlugin,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  MyEditor,
  MyValue,
} from '@decipad/editor-types';
import {
  createBlockquotePlugin,
  createDeserializeDocxPlugin,
  createDndPlugin,
  createHeadingPlugin,
  createListPlugin,
  createParagraphPlugin,
  createPlugins,
  createResetNodePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import type { Computer } from '@decipad/computer';
import { createVariableDefPlugin } from '@decipad/editor-variable-def';
import { createDataViewPlugin } from '@decipad/editor-data-view';
import { createJuicePlugin } from '@udecode/plate-juice';
import type { UserInteraction } from '@decipad/react-contexts';
import { Subject } from 'rxjs';
import { components } from './components';
import { autoformatRules } from './autoformat';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';

export const plugins = (
  computer: Computer,
  interactions?: Subject<UserInteraction>
) =>
  createPlugins<MyValue, MyEditor>(
    [
      // id uniqueness
      createUniqueElementIdPlugin(),

      // basic blocks
      createParagraphPlugin(),
      createBlockquotePlugin(),
      createHeadingPlugin({ options: { levels: 3 } }),
      createListPlugin(),

      createCalloutPlugin(),
      createDividerPlugin(),

      createDisplayPlugin(),

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
      // createTrailingParagraphPlugin(),
      createNormalizeColumnsPlugin(),

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
      createImportPlugin(interactions),
      createLiveConnectionPlugin(),

      // code editing
      createCodeVariableHighlightPlugin(),
      createAutoCompleteMenuPlugin(),
      createSyntaxErrorHighlightPlugin(),
      createAutoPairsPlugin(),
      createNavigationPlugin(),

      // language
      ...createEvalPlugin(computer),
      createCodeLinePlugin(),
      createUpdateComputerPlugin(computer),
      createVariableDefPlugin(),

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
      createJuicePlugin({}),

      // history
      createWithDocSyncHistoryPlugin(),

      createTrailingParagraphPlugin(),
    ],
    {
      components: components(computer),
    }
  );
