import {
  getConnectionDisplayLabel,
  useConnectionStore,
  useResourceUsage,
  useNotebookMetaData,
  ExecutionContext,
  TExecution,
} from '@decipad/react-contexts';
import {
  S,
  SelectIntegration,
  WrapperIntegrationModalDialog,
} from '@decipad/ui';
import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useAnalytics,
  useCreateIntegration,
  useIntegrationScreenFactory,
  useResetState,
} from '../hooks';
import {
  ImportElementSource,
  IntegrationTypes,
  MyEditor,
} from '@decipad/editor-types';
import { UpgradeWarningBlock } from '@decipad/editor-components';
import {
  CodeRunner,
  CSVRunner,
  GenericContainerRunner,
  LegacyRunner,
  useRunner as useIntegrationRunner,
} from '../runners';
import { useNotebookRoute } from '@decipad/routing';
import { IntegrationList } from './IntegrationList';
import { ExternalDataSourceFragmentFragment } from '@decipad/graphql-client';
import { Close } from 'libs/ui/src/icons';

import {
  useComputer,
  useGlobalFindNode,
  useGlobalFindNodeEntry,
  useLiveConnectionWorker,
} from '@decipad/editor-hooks';
import { ResultPreview } from './ResultPreview';
import { getNodeString } from '@udecode/plate-common';
import omit from 'lodash/omit';
import { Computer } from '@decipad/computer-interfaces';
import { useEditorController } from '@decipad/notebook-state';
import { pushResultToComputer } from '@decipad/computer-utils';
import { useToast } from '@decipad/toast';

interface IntegrationProps {
  readonly workspaceId: string;
  readonly editor: MyEditor;
}

const useRunner = (
  notebookId: string,
  computer: Computer,
  name: string,
  id: string,
  connectionType: ImportElementSource
): GenericContainerRunner => {
  const worker = useLiveConnectionWorker();
  return useMemo(() => {
    switch (connectionType) {
      case 'csv':
        const csv = new CSVRunner(name, id, undefined, undefined, notebookId);
        csv.setIsFirstRowHeader(true);
        return csv;
      case 'gsheets':
        const r = new LegacyRunner(
          name,
          id,
          worker,
          undefined,
          undefined,
          connectionType,
          notebookId
        );
        r.setIsFirstRowHeader(true);

        return r;
      case 'notion':
      case 'mysql':
        return new LegacyRunner(
          name,
          id,
          worker,
          undefined,
          undefined,
          connectionType,
          notebookId
        );
      case 'codeconnection':
        return new CodeRunner(notebookId, computer, name, id, undefined);
      default:
        throw new Error('NOT IMPLEMENTED');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionType, id, notebookId, computer, worker]);
};

const ConcreteIntegration: FC<IntegrationProps> = ({ workspaceId, editor }) => {
  const [stage, connectionType, setter, next, back, varName, blockId] =
    useConnectionStore((s) => [
      s.stage,
      s.connectionType,
      s.Set,
      s.next,
      s.back,
      s.varName,
      s.blockId,
    ]);

  const setSidebar = useNotebookMetaData((s) => s.setSidebar);

  const { queries } = useResourceUsage();

  const [info, onExecute] = useState<Array<TExecution>>([]);

  const [externalData, setExternalData] = useState<
    ExternalDataSourceFragmentFragment | undefined
  >(undefined);

  useAnalytics();

  const { notebookId } = useNotebookRoute();

  const computer = useComputer();
  const runner = useRunner(
    notebookId,
    computer,
    varName,
    blockId,
    connectionType!
  );
  useEffect(() => {
    runner.setName(varName);
  }, [runner, varName]);
  useEffect(() => {
    return () => {
      pushResultToComputer(computer, blockId, varName, undefined);
      computer.releaseExternalData(blockId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [loading, setLoading] = useState(false);

  const reachedLimit = useMemo(() => queries.hasReachedLimit, [queries]);

  const run = useCallback(() => {
    if (reachedLimit) return;

    onExecute([]);
    onExecute((v) => [...v, { status: 'run' }]);
    setLoading(true);

    runner.import().then((res) => {
      setLoading(false);

      if (res instanceof Error) {
        onExecute((v) => [...v, { status: 'error', err: blockId }]);
        return;
      }

      if (res) {
        queries.incrementUsageWithBackend(workspaceId);
      }

      onExecute((v) => [...v, { status: 'success', ok: true }]);
    });
  }, [blockId, queries, reachedLimit, runner, workspaceId]);

  const screen = useIntegrationScreenFactory(
    workspaceId,
    runner,
    run,
    externalData,
    setExternalData,
    loading
  );

  useCreateIntegration(editor, runner, notebookId);

  return (
    <ExecutionContext.Provider value={{ info, onExecute }}>
      <WrapperIntegrationModalDialog
        title="Connect to your data"
        infoPanel={
          <UpgradeWarningBlock
            type="queries"
            variant="block"
            workspaceId={workspaceId}
          />
        }
        tabs={{
          tabStage: stage,
          connectionTabLabel: getConnectionDisplayLabel(connectionType),
          onTabClick: (s) => setter({ stage: s }),
        }}
        onBack={back}
        onContinue={next}
        onClose={() => setSidebar({ type: 'closed' })}
      >
        {screen}
      </WrapperIntegrationModalDialog>
    </ExecutionContext.Provider>
  );
};

const EmptyWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const setSidebar = useNotebookMetaData((s) => s.setSidebar);

  return (
    <S.IntegrationWrapper>
      <S.CloseIconWrapper>
        {
          <div onClick={() => setSidebar({ type: 'closed' })}>
            <Close />
          </div>
        }
      </S.CloseIconWrapper>
      {children}
    </S.IntegrationWrapper>
  );
};

/**
 * Entry component for creating a new integration.
 */
export const Integrations: FC<IntegrationProps> = (props) => {
  const stage = useConnectionStore((s) => s.stage);

  useResetState();

  if (stage === 'pick-integration') {
    return (
      <EmptyWrapper>
        <SelectIntegration integrations={IntegrationList} />
      </EmptyWrapper>
    );
  }

  return <ConcreteIntegration {...props} />;
};

type EditIntegrationProps = IntegrationProps & { integrationBlockId: string };
type ConcreteEditIntegrationProps = EditIntegrationProps & {
  block: IntegrationTypes.IntegrationBlock;
};

const ConcreteEditIntegration: FC<ConcreteEditIntegrationProps> = ({
  workspaceId,
  block,
}) => {
  const setSidebar = useNotebookMetaData((s) => s.setSidebar);

  const findNode = useGlobalFindNode();
  const findNodeEntry = useGlobalFindNodeEntry();

  const controller = useEditorController();

  if (findNode == null || findNodeEntry == null || controller == null) {
    throw new Error('Needed functions cannot be null here');
  }

  const { queries } = useResourceUsage();

  const [loading, setLoading] = useState(false);
  const computer = useComputer();

  const varName = getNodeString(block.children[0]);
  const runner = useIntegrationRunner(
    varName,
    block.id!,
    block.integrationType,
    block.typeMappings,
    block.isFirstRowHeader
  );

  // Refactor this to allow for testing.

  const onEditBlock = useCallback(() => {
    const entry = findNodeEntry((n) => n.id === block.id);
    if (entry == null) {
      throw new Error('Could not find the integration you are trying to edit.');
    }

    const [, path] = entry;

    controller.apply({
      type: 'set_node',
      path,
      properties: omit(block, ['children']),
      newProperties: {
        ...omit(block, ['children']),
        typeMappings: runner.getTypes(),
      } satisfies Partial<IntegrationTypes.IntegrationBlock>,
    });

    setSidebar({ type: 'closed' });
  }, [block, controller, findNodeEntry, runner, setSidebar]);

  const toast = useToast();

  const hasReachedLimit = useMemo(() => queries.hasReachedLimit, [queries]);

  const run = useCallback(() => {
    if (hasReachedLimit) return;

    setLoading(true);
    runner.import().then((res) => {
      if (res instanceof Error) {
        toast.error(res.message);
      }
      if (res) {
        queries.incrementUsageWithBackend(workspaceId);
      }
      setLoading(false);
    });
  }, [queries, runner, workspaceId, hasReachedLimit, toast]);

  return (
    <WrapperIntegrationModalDialog
      title="Edit your integration"
      infoPanel={
        <UpgradeWarningBlock
          type="queries"
          variant="block"
          workspaceId={workspaceId}
        />
      }
      onBack={() => setSidebar({ type: 'closed' })}
      onContinue={onEditBlock}
      onClose={() => setSidebar({ type: 'closed' })}
    >
      <ResultPreview
        computer={computer}
        blockId={block.id!}
        name={varName}
        loading={loading}
        setName={() => {
          // not used.
        }}
        setTypeMapping={(index, type) => {
          runner.setTypeIndex(index, type);
          run();
        }}
        timeOfLastRun={undefined}
        columnsToHide={[]}
        setColumnsToHide={() => {
          // TODO: add hide columns
          // In another PR
        }}
        isFirstRowHeader={block.isFirstRowHeader}
        setFirstRowHeader={undefined}
      />
    </WrapperIntegrationModalDialog>
  );
};

/**
 * Entry component for editing an existing integration.
 *
 * We don't allow complete editing (such as changing URL), but we
 * allow changing types.
 */
export const EditIntegration: FC<EditIntegrationProps> = (props) => {
  const findNode = useGlobalFindNode();
  if (findNode == null) {
    return (
      <EmptyWrapper>
        Sorry, cannot edit integration. Please contact support.
      </EmptyWrapper>
    );
  }

  const block = findNode((n) => n.id === props.integrationBlockId) as
    | IntegrationTypes.IntegrationBlock
    | undefined;

  if (block == null || block.type !== 'integration-block') {
    return (
      <EmptyWrapper>
        Sorry, this integration seems to not exist in your notebook.
      </EmptyWrapper>
    );
  }

  return <ConcreteEditIntegration {...props} block={block} />;
};
