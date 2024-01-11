import { ClientEventContextType } from '@decipad/client-events';
import { createDataViewPlugin } from '@decipad/editor-data-view';
import { createIntegrationPlugin } from '@decipad/editor-integrations';
import {
  createCrossBlockSelection,
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
  createEventInterceptionSuperHandlerPlugin,
  createExitBreakPlugin,
  createIframePlugin,
  createSubmitFormPlugin,
  createImagePlugin,
  createImportPlugin,
  createLayoutColumnsPlugin,
  createLinkPlugin,
  createLiveConnectionPlugin,
  createLiveDataSetPlugin,
  createLiveQueryPlugin,
  createMarksPlugins,
  createMediaEmbedPlugin,
  createMigrateStructuredInputs,
  createMigrateTableDropdownToId,
  createNavigationPlugin,
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
  createOperationsBlackboxPlugin,
  createPersistSelectionPlugin,
  createPlotPlugin,
  createPotentialFormulaHighlightPlugin,
  createPreventInvalidSelectionPlugin,
  createRenderPerformanceStatsPlugin,
  createSelectionShortcutPlugin,
  createSmartRefPlugin,
  createSoftBreakPlugin,
  createSyntaxErrorHighlightPlugin,
  createTrailingParagraphPlugin,
  createTypeErrorHighlightPlugin,
  createUserEventPlugin,
  createTabSelectionPlugin,
  createMathPlugin,
} from '@decipad/editor-plugins';
import { createTablePlugin } from '@decipad/editor-table';
import {
  ELEMENT_DRAW,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  MyEditor,
  MyValue,
  createTAutoformatPlugin,
} from '@decipad/editor-types';
import { noopPromise } from '@decipad/editor-utils';
import { createVariableDefPlugin } from '@decipad/editor-variable-def';
import type { UserInteraction } from '@decipad/react-contexts';
import type { RemoteComputer } from '@decipad/remote-computer';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createPlugins } from '@udecode/plate-common';
import { createJuicePlugin } from '@udecode/plate-juice';
import { Subject } from 'rxjs';
import { autoformatRules } from './autoformat';
import { components } from './components';
import { exitBreakOptions } from './exitBreakOptions';
import { resetBlockTypeOptions } from './resetBlockTypeOptions';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createListPlugin } from '@udecode/plate-list';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createCaptionPlugin } from '@udecode/plate-caption';

interface PluginOptions {
  computer: RemoteComputer;
  events?: ClientEventContextType;
  readOnly: boolean;
  interactions?: Subject<UserInteraction>;
}

export const plugins = ({
  computer,
  events = noopPromise,
  readOnly,
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
      createIframePlugin(),
      createIntegrationPlugin(),
      createCrossBlockSelection(),
      createSubmitFormPlugin(),

      // Layout blocks
      createLayoutColumnsPlugin(),

      // structure enforcement
      createNormalizeEditorPlugin(),
      createNormalizeVoidPlugin(),
      createNormalizeRichTextBlockPlugin(),
      createNormalizePlainTextBlockPlugin(),
      createNormalizeCodeLinePlugin(computer),
      createNormalizeListPlugin(),
      createNormalizeLinkPlugin(),
      createNormalizeImagePlugin(),
      createNormalizeElementIdPlugin()(),
      createDeduplicateElementIdsPlugin()(),
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
      createCaptionPlugin({
        options: { pluginKeys: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED] },
      }),
      createTAutoformatPlugin({
        options: { rules: autoformatRules(computer) },
      }),
      createAutoFormatCodeLinePlugin(computer)(),
      createImportPlugin(interactions),
      createLiveConnectionPlugin()(),
      createLiveDataSetPlugin()(),
      createLiveQueryPlugin()(),

      // code editing
      createCodeVariableHighlightPlugin(),
      createAutoCompleteMenuPlugin(),
      createSyntaxErrorHighlightPlugin(),
      createTypeErrorHighlightPlugin(),
      createAutoPairsPlugin(computer),
      createNavigationPlugin(),
      createSmartRefPlugin(),

      // language
      createCodeLinePlugin(computer),
      createCodeLineV2Plugin(computer),
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
      createDeserializeMdPlugin(),
      createJuicePlugin({}),

      createUserEventPlugin(events),

      // shortcuts
      createSelectionShortcutPlugin(),
      createRenderPerformanceStatsPlugin(),
      createTabSelectionPlugin(),
      // selection
      createPersistSelectionPlugin(),

      // drawings
      createDrawPlugin(),

      // event interception
      createEventInterceptionSuperHandlerPlugin(),

      // Migrations
      createMigrateStructuredInputs(),
      createMigrateTableDropdownToId(),
      createPreventInvalidSelectionPlugin(),

      // math display
      createMathPlugin(),
    ],
    {
      components: components(computer),
    }
  );
