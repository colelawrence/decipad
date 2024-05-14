import {
  DraggableBlock,
  insertDataViewBelow,
  insertPlotBelow,
} from '@decipad/editor-components';
import { useNodePath } from '@decipad/editor-hooks';
import type {
  IntegrationTypes,
  MyElement,
  PlateComponent,
  SimpleTableCellType,
} from '@decipad/editor-types';
import {
  ELEMENT_INTEGRATION,
  ImportElementSourcePretty,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isStructuredElement } from '@decipad/editor-utils';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import {
  useComputer,
  useConnectionStore,
  useCurrentWorkspaceStore,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { removeFocusFromAllBecauseSlate } from '@decipad/react-utils';
import { getExprRef } from '@decipad/remote-computer';
import type { MarkType } from '@decipad/ui';
import {
  AnimatedIcon,
  IntegrationBlock as UIIntegrationBlock,
  UpgradePlanWarningTooltip,
  icons,
} from '@decipad/ui';
import {
  getNodeString,
  getPreviousNode,
  setNodes,
} from '@udecode/plate-common';
import type { ComponentProps, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import type { ContextActions } from '../hooks';
import { IntegrationBlockContext } from '../hooks';
import { CodeIntegration } from './CodeIntegration';
import { NotionIntegration } from './NotionIntegration';
import { SQLIntegration } from './SQLIntegration';
import { useClientEvents } from '@decipad/client-events';
import { GoogleSheetIntegration } from './GoogleSheetIntegration';
import { pushResultToComputer } from '@decipad/live-connect';

function getIntegrationComponent(
  element: IntegrationTypes.IntegrationBlock
): ReactNode {
  //
  // Ok, its a little big cursed.
  //
  // We can spread the element as long as we specify `integrationType`,
  // but we also want access to the `raw` element. This is just a way to
  // prevent type casting.
  //
  // TypeScript cannot narrow unions based on children type unfortuntely :(
  //

  switch (element.integrationType.type) {
    case 'codeconnection':
      return (
        <CodeIntegration
          {...element}
          element={element}
          integrationType={element.integrationType}
        />
      );
    case 'mysql':
      return (
        <SQLIntegration
          {...element}
          element={element}
          integrationType={element.integrationType}
        />
      );
    case 'notion':
      return (
        <NotionIntegration
          {...element}
          element={element}
          integrationType={element.integrationType}
        />
      );
    case 'gsheets':
      return (
        <GoogleSheetIntegration
          {...element}
          element={element}
          integrationType={element.integrationType}
        />
      );
    default:
      return null;
  }
}

type IntegrationButtons = Pick<
  ComponentProps<typeof UIIntegrationBlock>,
  'actionButtons'
>;

export const IntegrationBlock: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_INTEGRATION);

  const observable = useRef(new Subject<ContextActions>());
  const [animated, setAnimated] = useState(false);

  const editor = useMyEditorRef();
  const path = useNodePath(element);
  const prevElement = getPreviousNode<MyElement>(editor, { at: path });
  const { workspaceInfo, setCurrentWorkspaceInfo, isQuotaLimitBeingReached } =
    useCurrentWorkspaceStore();
  const { quotaLimit, queryCount, id } = workspaceInfo;
  const [, updateQueryExecCount] = useIncrementQueryCountMutation();
  const [maxQueryExecution, setMaxQueryExecution] = useState(false);
  const { setAllTypeMapping } = useConnectionStore();
  const computer = useComputer();

  useEffect(() => {
    return () => {
      const varName = getNodeString(element.children[0]);

      pushResultToComputer(computer, element.id, varName, undefined);
    };
  }, [computer, element.children, element.id]);

  useEffect(() => {
    setAllTypeMapping(element.typeMappings);
  }, [element.typeMappings, setAllTypeMapping]);

  useEffect(() => {
    if (queryCount && quotaLimit) {
      setMaxQueryExecution(quotaLimit <= queryCount);
    }
  }, [quotaLimit, queryCount]);
  const updateQueryExecutionCount = useCallback(async () => {
    return updateQueryExecCount({
      id: id || '',
    });
  }, [id, updateQueryExecCount]);

  const specificIntegration = getIntegrationComponent(element);
  const blockResult = computer.getBlockIdResult$.use(element.id);

  const readOnly = useIsEditorReadOnly();

  const { timeOfLastRun } = element;

  const [showData, setShowData] = useState(false);

  const resultType = blockResult?.result?.type;
  // @ts-ignore - it does exist
  const err = resultType?.errorCause;

  const errCause =
    err?.errType === 'duplicated-name'
      ? 'Variable name is duplicated. Change it.'
      : 'An error has occured';

  const blockType = useMemo(
    () => blockResult?.result?.type.kind,
    [blockResult?.result?.type.kind]
  );

  const liveText = useMemo(
    () => ImportElementSourcePretty[element.integrationType.type],
    [element.integrationType.type]
  );

  const onChangeColumnType = useCallback(
    (columnIndex: number, colType?: SimpleTableCellType) => {
      const typeMappings = element.typeMappings.slice(0);
      typeMappings[columnIndex] = colType;
      setNodes(
        editor,
        {
          typeMappings,
        },
        { at: path }
      );
    },
    [editor, element.typeMappings, path]
  );

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

  const canBePlotted =
    resultType?.kind === 'materialized-column' ||
    resultType?.kind === 'column' ||
    resultType?.kind === 'table' ||
    resultType?.kind === 'materialized-table';
  const editButton = {
    type: 'button' as 'button',
    text: 'Edit source',
    onClick: () => {
      observable.current.next('show-source');
      removeFocusFromAllBecauseSlate();
    },
    icon: <icons.Source />,
  };
  const { actionButtons }: IntegrationButtons = {
    actionButtons: canBePlotted
      ? [
          editButton,
          {
            type: 'button',
            text: 'Pivot view',
            onClick: onAddDataViewButtonPress,
            icon: <icons.TableSmall />,
          },
          {
            type: 'chart',
            onClick: onAddChartViewButtonPress,
          },
        ]
      : [editButton],
  };

  const track = useClientEvents();

  const handleClick = async () => {
    setAnimated(true);
    const result = await updateQueryExecutionCount();
    const newExecutedQueryData = result.data?.incrementQueryCount;
    const errors = result.error?.graphQLErrors;
    const limitExceededError = errors?.find(
      (error) => error.extensions.code === 'LIMIT_EXCEEDED'
    );
    setTimeout(() => {
      setAnimated(false);
    }, 1000);
    setAnimated(true);

    if (newExecutedQueryData) {
      observable.current.next('refresh');

      track({
        segmentEvent: {
          type: 'action',
          action: 'Integration: Query sent',
          props: { type: element.integrationType.type },
        },
      });

      setCurrentWorkspaceInfo({
        ...workspaceInfo,
        queryCount: newExecutedQueryData.queryCount,
        quotaLimit: newExecutedQueryData.quotaLimit,
      });
    } else if (limitExceededError) {
      setMaxQueryExecution(true);
    }
    removeFocusFromAllBecauseSlate();
  };

  const tooltipContent =
    isQuotaLimitBeingReached || maxQueryExecution ? (
      <UpgradePlanWarningTooltip
        maxQueryExecution={maxQueryExecution}
        quotaLimit={quotaLimit}
        showQueryQuotaLimit={isQuotaLimitBeingReached}
        workspaceId={workspaceInfo.id}
        featureCustomText="Unlock refresh data"
      />
    ) : (
      'Refresh data'
    );

  return (
    <IntegrationBlockContext.Provider value={observable.current}>
      <DraggableBlock
        {...attributes}
        element={element}
        blockKind="live"
        hasPreviousSibling={isStructuredElement(prevElement?.[0])}
        onDelete={() => observable.current.next('delete-block')}
      >
        <UIIntegrationBlock
          meta={
            timeOfLastRun ? [{ label: 'Last run', value: timeOfLastRun }] : []
          }
          error={err && new Error(errCause)}
          type={blockType}
          text={liveText}
          children={children} // text input
          onChangeColumnType={onChangeColumnType}
          integrationChildren={specificIntegration}
          actionButtons={actionButtons}
          buttons={[
            {
              children: (
                <AnimatedIcon icon={<icons.Refresh />} animated={animated} />
              ),
              onClick: handleClick,
              tooltip: tooltipContent,
              visible: !readOnly,
              disabled: maxQueryExecution,
            },
            {
              children: showData ? <icons.Hide /> : <icons.Show />,
              onClick: () => {
                setShowData(!showData);
                removeFocusFromAllBecauseSlate();
              },
              tooltip: `${showData ? 'Hide' : 'Show'} table`,
            },
          ]}
          displayResults={showData}
          result={blockResult?.result}
        />
      </DraggableBlock>
    </IntegrationBlockContext.Provider>
  );
};
