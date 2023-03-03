import { ClientEventContextType } from '@decipad/client-events';
import type { Computer } from '@decipad/computer';
import { createDataViewPlugin } from '@decipad/editor-data-view';
import { noopPromise } from '@decipad/editor-utils';
import {
  createAttachmentPlugin,
  createAutoCompleteMenuPlugin,
  createAutoFormatCodeLinePlugin,
  createAutoPairsPlugin,
  createBlockSelectionPlugin,
  createCalloutPlugin,
  createCodeLinePlugin,
  createCodeLineV2Plugin,
  createCodeVariableHighlightPlugin,
  createDeduplicateElementIdsPlugin,
  createDisplayPlugin,
  createDividerPlugin,
  createDndSmartRefPlugin,
  createDragOverCursorPlugin,
  createDrawPlugin,
  createEditorApplyErrorReporterPlugin,
  createEvalPlugin,
  createEventInterceptionSuperHandlerPlugin,
  createExitBreakPlugin,
  createImagePlugin,
  createImportPlugin,
  createLayoutColumnsPlugin,
  createLinkPlugin,
  createLiveConnectionPlugin,
  createMarksPlugins,
  createMediaEmbedPlugin,
  createMigrateStructuredInputs,
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
  createRemoteCursorsPlugin,
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
  createHeadingPlugin,
  createListPlugin,
  createParagraphPlugin,
  createPlugins,
  createResetNodePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import { createJuicePlugin } from '@udecode/plate-juice';
import { Subject } from 'rxjs';
import { createDndPlugin } from '@udecode/plate-ui-dnd';
import { autoformatRules } from './autoformat';
import { components } from './components';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';

interface PluginOptions {
  computer: Computer;
  events?: ClientEventContextType;
  readOnly: boolean;
  notebookTitle?: string;
  onNotebookTitleChange?: (newTitle: string) => void;
  interactions?: Subject<UserInteraction>;
}

export const plugins = ({
  computer,
  events = noopPromise,
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
      createDeduplicateElementIdsPlugin(),
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
      createAttachmentPlugin(),
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
        options: { rules: autoformatRules(computer) },
      }),
      createAutoFormatCodeLinePlugin(computer)(),
      createImportPlugin(interactions),
      createLiveConnectionPlugin(),

      // code editing
      createCodeVariableHighlightPlugin(),
      createAutoCompleteMenuPlugin(),
      createSyntaxErrorHighlightPlugin(),
      createAutoPairsPlugin(computer),
      createNavigationPlugin(),
      createSmartRefPlugin(),

      // language
      ...createEvalPlugin(computer),
      createCodeLinePlugin(computer),
      createCodeLineV2Plugin(computer),
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

      // shortcuts
      createSelectionShortcutPlugin(),
      createRenderPerformanceStatsPlugin(),

      // selection
      createPersistSelectionPlugin(),

      // drawings
      createDrawPlugin(),

      // remote cursors,
      createRemoteCursorsPlugin(),

      // event interception
      createEventInterceptionSuperHandlerPlugin(),

      // Migrations
      createMigrateStructuredInputs(),
    ],
    {
      components: components(computer),
    }
  );
