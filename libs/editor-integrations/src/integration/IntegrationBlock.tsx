import {
  getNodeString,
  getPreviousNode,
  setNodes,
} from '@udecode/plate-common';
import type { ComponentProps } from 'react';
import { useCallback } from 'react';
import { useClientEvents } from '@decipad/client-events';
import {
  DraggableBlock,
  UpgradeWarningBlock,
  insertDataViewBelow,
  insertPlotBelow,
} from '@decipad/editor-components';
import { useComputer, useNodePath } from '@decipad/editor-hooks';
import type {
  IntegrationTypes,
  MarkType,
  MyElement,
  PlateComponent,
} from '@decipad/editor-types';
import {
  ELEMENT_INTEGRATION,
  ImportElementSourcePretty,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isStructuredElement } from '@decipad/editor-utils';
import {
  useIsEditorReadOnly,
  useNotebookMetaData,
  useResourceUsage,
} from '@decipad/react-contexts';
import { Result, getExprRef } from '@decipad/remote-computer';
import {
  AnimatedIcon,
  CodeResult,
  IntegrationBlock as UIIntegrationBlock,
  icons,
} from '@decipad/ui';
import { assert } from '@decipad/utils';

function canBePlotted(result: Result.Result | undefined): boolean {
  return (
    result?.type.kind === 'materialized-column' ||
    result?.type.kind === 'column' ||
    result?.type.kind === 'table' ||
    result?.type.kind === 'materialized-table'
  );
}

export const IntegrationBlock: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_INTEGRATION);

  const [setSidebar] = useNotebookMetaData((s) => [s.setSidebar]);

  const editor = useMyEditorRef();
  const path = useNodePath(element);
  const prevElement = getPreviousNode<MyElement>(editor, { at: path });
  const computer = useComputer();
  const readOnly = useIsEditorReadOnly();

  const onRefresh = () => {
    assert(path != null);

    setNodes(
      editor,
      {
        timeOfLastRun: Date.now().toString(),
      } satisfies Partial<IntegrationTypes.IntegrationBlock>,
      { at: path }
    );
  };

  const result = computer.getBlockIdResult$.use(element.id)?.result;

  const onAddDataViewButtonPress = useCallback(() => {
    return (
      path &&
      insertDataViewBelow(
        editor,
        path,
        computer,
        element.id,
        getNodeString(element.children[0])
      )
    );
  }, [computer, editor, element, path]);

  const onAddChartViewButtonPress = useCallback(
    (markType: MarkType) => {
      return (
        path && insertPlotBelow(editor, path, markType, getExprRef(element.id))
      );
    },
    [editor, element.id, path]
  );

  const actionButtons: ComponentProps<
    typeof UIIntegrationBlock
  >['actionButtons'] = [
    {
      type: 'button',
      text: 'Edit',
      onClick: () => {
        setSidebar({ type: 'integrations', blockId: element.id });
      },
    },
    ...(!canBePlotted(result)
      ? []
      : [
          {
            type: 'button' as const,
            text: 'Pivot view',
            onClick: onAddDataViewButtonPress,
            icon: <icons.TableSmall />,
          },
          {
            type: 'chart' as const,
            onClick: onAddChartViewButtonPress,
          },
        ]),
  ];

  const track = useClientEvents();
  const { queries } = useResourceUsage();

  const handleClick = async () => {
    if (queries.hasReachedLimit) return;

    onRefresh();

    track({
      segmentEvent: {
        type: 'action',
        action: 'Notebook Integration Query Submitted',
        props: {
          integration_type: element.integrationType.type,
          analytics_source: 'frontend',
        },
      },
    });
  };

  const integrationTypeText =
    element.integrationType.type === 'mysql' && element.integrationType.provider
      ? element.integrationType.provider
      : element.integrationType.type;

  const lastRun = element.timeOfLastRun && parseInt(element.timeOfLastRun, 10);
  const lastRunFmt =
    !lastRun || isNaN(lastRun) ? null : new Date(lastRun).toLocaleString();
  return (
    <DraggableBlock
      element={element}
      blockKind="live"
      hasPreviousSibling={isStructuredElement(prevElement?.[0])}
      slateAttributes={attributes}
    >
      <UIIntegrationBlock
        meta={
          element.timeOfLastRun
            ? [
                {
                  label: 'Last run',
                  value: lastRunFmt ?? element.timeOfLastRun,
                },
              ]
            : []
        }
        text={ImportElementSourcePretty[integrationTypeText]}
        actionButtons={actionButtons}
        buttons={[
          {
            children: (
              <AnimatedIcon icon={<icons.Refresh />} animated={false} />
            ),
            onClick: handleClick,
            tooltip: (
              <UpgradeWarningBlock
                type="queries"
                variant="tooltip"
                fallback="Refresh Data"
                featureText="Unlock Refresh Data"
              />
            ),
            visible: !readOnly,
            disabled: queries.hasReachedLimit,
          },
          {
            children: element.hideResult ? <icons.Show /> : <icons.Hide />,
            onClick: (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              if (path) {
                setNodes(
                  editor,
                  { hideResult: !element.hideResult },
                  { at: path }
                );
              }
            },
            tooltip: `${element.hideResult ? 'Show' : 'Hide'} table`,
          },
        ]}
        result={result}
        resultPreview={
          result != null && !element.hideResult ? (
            <CodeResult {...result} isLiveResult />
          ) : null
        }
      >
        {children}
      </UIIntegrationBlock>
    </DraggableBlock>
  );
};
