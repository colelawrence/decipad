import { ClientEventContextType } from '@decipad/client-events';
import type { Computer } from '@decipad/computer';
import { createDataViewPlugin } from '@decipad/editor-data-view';
import {
  createAutoCompleteMenuPlugin,
  createAutoFormatCodeLinePlugin,
  createAutoPairsPlugin,
  createBlockSelectionPlugin,
  createCalloutPlugin,
  createCodeLinePlugin,
  createCodeVariableHighlightPlugin,
  createDisplayPlugin,
  createDividerPlugin,
  createDndSmartRefPlugin,
  createDragOverCursorPlugin,
  createDrawPlugin,
  createEditorApplyErrorReporterPlugin,
  createEvalPlugin,
  createExitBreakPlugin,
  createImagePlugin,
  createImportPlugin,
  createLayoutColumnsPlugin,
  createLinkPlugin,
  createLiveConnectionPlugin,
  createMarksPlugins,
  createMediaEmbedPlugin,
  createNavigationPlugin,
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
  createNotebookTitlePlugin,
  createOperationsBlackboxPlugin,
  createPersistSelectionPlugin,
  createPlotPlugin,
  createPotentialFormulaHighlightPlugin,
  createRenderPerformanceStatsPlugin,
  createSelectionShortcutPlugin,
  createSmartRefPlugin,
  createSoftBreakPlugin,
  createSyntaxErrorHighlightPlugin,
  createTrailingParagraphPlugin,
  createUpdateComputerPlugin,
  createUserEventPlugin,
  createWithDocSyncHistoryPlugin,
} from '@decipad/editor-plugins';
import { createTablePlugin } from '@decipad/editor-table';
import {
  createTAutoformatPlugin,
  ELEMENT_DRAW,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  MyEditor,
  MyValue,
} from '@decipad/editor-types';
import { createVariableDefPlugin } from '@decipad/editor-variable-def';
import type { UserInteraction } from '@decipad/react-contexts';
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
import { createJuicePlugin } from '@udecode/plate-juice';
import { Subject } from 'rxjs';
import { autoformatRules } from './autoformat';
import { components } from './components';
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
      createTrailingParagraphPlugin(),
      createNormalizeColumnsPlugin(),

      // Drag and drop entities
      createDndSmartRefPlugin(computer),

      // block manipulation
      createExitBreakPlugin({ options: exitBreakOptions }),
      createSoftBreakPlugin(),
      createResetNodePlugin({ options: resetBlockTypeOptions }),
      createDndPlugin({
        options: {
          enableScroller: true,
          scrollerProps: { strengthMultiplier: 30 },
        },
      }),
      createDragOverCursorPlugin(),
      createBlockSelectionPlugin(),

      // media elements
      createSelectOnBackspacePlugin({
        options: {
          query: {
            allow: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED, ELEMENT_DRAW],
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
      createCodeLinePlugin(computer),
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

      // drawings
      createDrawPlugin(),
    ],
    {
      components: components(computer),
    }
  );
