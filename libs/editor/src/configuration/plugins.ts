import {
  createAutoCompleteMenuPlugin,
  createAutoFormatCodeLinePlugin,
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
  createPersistSelectionPlugin,
  createPlotPlugin,
  createSoftBreakPlugin,
  createSyntaxErrorHighlightPlugin,
  createNavigationPlugin,
  createUpdateComputerPlugin,
  createWithDocSyncHistoryPlugin,
  createUserEventPlugin,
  createSmartRefPlugin,
  createTrailingParagraphPlugin,
  createSelectionShortcutPlugin,
  createRenderPerformanceStatsPlugin,
  createPotentialFormulaHighlightPlugin,
  createNotebookTitlePlugin,
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
import { ClientEventContextType } from '@decipad/client-events';
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

interface PluginOptions {
  computer: Computer;
  events: ClientEventContextType;
  readOnly: boolean;
  notebookTitle?: string;
  onNotebookTitleChange?: (newTitle: string) => void;
  interactions?: Subject<UserInteraction>;
}

export const plugins = ({
  computer,
  events,
  readOnly,
  notebookTitle,
  onNotebookTitleChange,
  interactions,
}: PluginOptions) =>
  createPlugins<MyValue, MyEditor>(
    [
      // basic blocks
      createParagraphPlugin(),
      createBlockquotePlugin(),
      createHeadingPlugin({ options: { levels: 3 } }),
      createListPlugin(),

      createCalloutPlugin(),
      createDividerPlugin(),

      createDisplayPlugin(),

      createNotebookTitlePlugin({
        readOnly,
        notebookTitle,
        onNotebookTitleChange,
      }),

      // Layout blocks
      createLayoutColumnsPlugin(),

      // structure enforcement
      createNormalizeEditorPlugin(),
      createNormalizeVoidPlugin(),
      createNormalizeRichTextBlockPlugin(),
      createNormalizePlainTextBlockPlugin(),
      createNormalizeCodeBlockPlugin(),
      createNormalizeCodeLinePlugin(computer),
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
      createAutoFormatCodeLinePlugin(),
      createImportPlugin(interactions),
      createLiveConnectionPlugin(),

      // code editing
      createCodeVariableHighlightPlugin(),
      createAutoCompleteMenuPlugin(),
      createSyntaxErrorHighlightPlugin(),
      createAutoPairsPlugin(),
      createNavigationPlugin(),
      createSmartRefPlugin(),

      // language
      ...createEvalPlugin(computer),
      createCodeLinePlugin(),
      createUpdateComputerPlugin(computer),
      createVariableDefPlugin(),
      createPotentialFormulaHighlightPlugin(readOnly),

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

      createUserEventPlugin(events),
      createTrailingParagraphPlugin(),

      // shortcuts
      createSelectionShortcutPlugin(),
      createRenderPerformanceStatsPlugin(),

      // selection
      createPersistSelectionPlugin(),
    ],
    {
      components: components(computer),
    }
  );
