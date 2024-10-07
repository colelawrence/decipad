import {
  getNodeString,
  getPreviousNode,
  setNodes,
} from '@udecode/plate-common';
import type { ComponentProps } from 'react';
import { useCallback, useEffect } from 'react';
import { useClientEvents } from '@decipad/client-events';
import {
  DraggableBlock,
  UpgradeWarningBlock,
  insertDataViewBelow,
  insertPlotBelow,
} from '@decipad/editor-components';
import { useComputer, useNodePath } from '@decipad/editor-hooks';
import type {
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
  useCurrentWorkspaceStore,
  useIsEditorReadOnly,
  useNotebookMetaData,
  useResourceUsage,
} from '@decipad/react-contexts';
import { Result, getExprRef } from '@decipad/remote-computer';
import {
  AnimatedIcon,
  CodeError,
  CodeResult,
  IntegrationBlock as UIIntegrationBlock,
  icons,
} from '@decipad/ui';
import { useToast } from '@decipad/toast';
import { useIntegration } from '../hooks/useIntegration';

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

  const { onRefresh, loading, error } = useIntegration(element);

  // error handling
  const toast = useToast();
  useEffect(() => {
    if (error) {
      toast.error(`Error in integration: ${error.message}`);
    }
  }, [error, toast]);

  const workspaceId = useCurrentWorkspaceStore((w) => w.workspaceInfo.id);

  const [setSidebar, setIntegrationBlockId] = useNotebookMetaData((s) => [
    s.setSidebar,
    s.setIntegrationBlockId,
  ]);

  const editor = useMyEditorRef();
  const path = useNodePath(element);
  const prevElement = getPreviousNode<MyElement>(editor, { at: path });
  const computer = useComputer();
  const readOnly = useIsEditorReadOnly();

  const result = computer.getBlockIdResult$.use(element.id!)?.result;

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
        path &&
        insertPlotBelow(editor, path, markType, getExprRef(element.id ?? ''))
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
        setSidebar({ type: 'edit-integration' });
        setIntegrationBlockId(element.id ?? '');
      },
      icon: <icons.Edit />,
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

    if (workspaceId) {
      //
      // Potentially undefined because we could be in the Playground
      // And there we don't want to increment usage.
      //
      queries.incrementUsageWithBackend(workspaceId);
    }

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

  return (
    <DraggableBlock
      {...attributes}
      element={element}
      blockKind="live"
      hasPreviousSibling={isStructuredElement(prevElement?.[0])}
    >
      <UIIntegrationBlock
        meta={
          element.timeOfLastRun
            ? [{ label: 'Last run', value: element.timeOfLastRun }]
            : []
        }
        error={undefined}
        text={ImportElementSourcePretty[element.integrationType.type]}
        actionButtons={actionButtons}
        buttons={[
          {
            children: (
              <AnimatedIcon icon={<icons.Refresh />} animated={loading} />
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
      {error ? <CodeError message={error.message} /> : null}
    </DraggableBlock>
  );
};
