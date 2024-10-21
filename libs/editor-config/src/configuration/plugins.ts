import type { Computer } from '@decipad/computer-interfaces';
import { ClientEventContextType } from '@decipad/client-events';
import { createDataViewPlugin } from '@decipad/editor-data-view';
import { createIntegrationPlugin } from '@decipad/editor-integrations';
import {
  createCrossBlockSelection,
  createAttachmentPlugin,
  createAutoCompleteMenuPlugin,
  createAutoPairsPlugin,
  createBlockSelectionPlugin,
  createCalloutPlugin,
  createCodeLinePlugin,
  createCodeVariableHighlightPlugin,
  createDeduplicateElementIdsPlugin,
  createDisplayPlugin,
  createDividerPlugin,
  createDndBlockPlugin,
  createDndSmartRefPlugin,
  createDragOverCursorPlugin,
  createDrawPlugin,
  createEditorApplyErrorReporterPlugin,
  createEventInterceptionSuperHandlerPlugin,
  createExitBreakPlugin,
  createIframePlugin,
  createSubmitFormPlugin,
  createImagePlugin,
  createLayoutPlugin,
  createLinkPlugin,
  createMarksPlugins,
  createMediaEmbedPlugin,
  createMetricPlugin,
  createMigrateStructuredInputs,
  createMigrateTableDropdownToId,
  createNavigationPlugin,
  createNormalizeLayoutPlugin,
  createNormalizeEditorPlugin,
  createNormalizeLinkPlugin,
  createNormalizeListPlugin,
  createNormalizePlainTextBlockPlugin,
  createNormalizeRichTextBlockPlugin,
  createNormalizeTextPlugin,
  createNormalizeVoidPlugin,
  createPersistSelectionPlugin,
  createPlotPlugin,
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
  createTransformH1,
  createStructuredKeyboard,
  createCodeLineRootPlugin,
  createCodeLineVarnamePlugin,
  createCodeLineCodeTextPlugin,
  createAutoFormatCodeLinePlugin,
  createCrashingBlock,
} from '@decipad/editor-plugins';
import {
  createCodeLineV2Plugin,
  createNormalizeCodeLinePlugin,
  createNormalizeElementIdPlugin,
} from '@decipad/editor-plugin-factories';
import { createTablePlugin } from '@decipad/editor-table';
import {
  createMyAutoformatPlugin,
  createMyPlugins,
  ELEMENT_DRAW,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
} from '@decipad/editor-types';
import { noopPromise } from '@decipad/editor-utils';
import { createVariableDefPlugin } from '@decipad/editor-variable-def';
import type { UserInteraction } from '@decipad/react-contexts';

import { createDndPlugin } from '@udecode/plate-dnd';
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
  computer: Computer;
  events?: ClientEventContextType;
  interactions?: Subject<UserInteraction>;
}

export const plugins = ({
  computer,
  events = noopPromise,
  interactions,
}: PluginOptions) =>
  createMyPlugins(
    [
      // basic blocks
      createParagraphPlugin(),
      createBlockquotePlugin(),
      createHeadingPlugin({ options: { levels: 3 } }),
      createListPlugin(),

      createCalloutPlugin(),
      createDividerPlugin(),

      createDisplayPlugin(),
      createMetricPlugin(),
      createIframePlugin(),
      createIntegrationPlugin(),
      createCrossBlockSelection(),
      createSubmitFormPlugin(),

      // Layout blocks
      createLayoutPlugin(),

      // structure enforcement
      createNormalizeEditorPlugin(),
      createNormalizeVoidPlugin(),
      createNormalizeRichTextBlockPlugin(),
      createNormalizePlainTextBlockPlugin(),
      createNormalizeCodeLinePlugin(computer),
      createNormalizeListPlugin(),
      createNormalizeLinkPlugin(),
      createNormalizeElementIdPlugin()(),
      createDeduplicateElementIdsPlugin()(),
      createNormalizeTextPlugin(),
      createTrailingParagraphPlugin(),
      createNormalizeLayoutPlugin(),

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
      createDndBlockPlugin(),
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
      createMyAutoformatPlugin({
        options: { rules: autoformatRules(computer) },
      }),

      // code editing
      createCodeVariableHighlightPlugin(),
      createAutoCompleteMenuPlugin(),
      createSyntaxErrorHighlightPlugin(),
      createTypeErrorHighlightPlugin(),
      createAutoPairsPlugin(computer),
      createNavigationPlugin(),
      createSmartRefPlugin(),
      createAutoFormatCodeLinePlugin(computer, interactions)(),

      // language
      createCodeLinePlugin(computer),
      createCodeLineV2Plugin(
        computer,
        createStructuredKeyboard(computer),
        createCodeLineRootPlugin(computer),
        createCodeLineVarnamePlugin(computer),
        createCodeLineCodeTextPlugin(computer)
      ),
      createVariableDefPlugin(computer),

      // tables
      createTablePlugin(computer),
      createDataViewPlugin(),

      // plots
      createPlotPlugin(),

      // error handling
      createEditorApplyErrorReporterPlugin(),

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
      createTransformH1(),
      createCrashingBlock(),
      // math display
      createMathPlugin(),
    ],
    {
      components,
    }
  );
