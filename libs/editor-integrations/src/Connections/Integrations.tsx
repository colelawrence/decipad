import {
  ExecutionContext,
  getConnectionDisplayLabel,
  useCodeConnectionStore,
  useConnectionStore,
  TExecution,
  useResourceUsage,
} from '@decipad/react-contexts';
import { Dialog, WrapperIntegrationModalDialog } from '@decipad/ui';
import type { FC } from 'react';
import { useState } from 'react';
import {
  useAnalytics,
  useConnectionActionMenu,
  useCreateIntegration,
  useIntegrationScreenFactory,
  useResetState,
} from '../hooks';
import { UpgradeWarningBlock } from '@decipad/editor-components';

interface IntegrationProps {
  readonly workspaceId?: string;
}

export const Integrations: FC<IntegrationProps> = ({ workspaceId = '' }) => {
  const [
    open,
    changeOpen,
    stage,
    connectionType,
    setter,
    next,
    back,
    existingIntegration,
  ] = useConnectionStore((s) => [
    s.open,
    s.changeOpen,
    s.stage,
    s.connectionType,
    s.Set,
    s.next,
    s.back,
    s.existingIntegration,
  ]);
  const codeStoreReset = useCodeConnectionStore((s) => s.reset);

  const [info, onExecute] = useState<TExecution<boolean>>({
    status: 'unset',
  });

  const screen = useIntegrationScreenFactory(workspaceId);
  const actionMenu = useConnectionActionMenu(workspaceId, onExecute);

  const { queries } = useResourceUsage();

  useCreateIntegration();
  useAnalytics();
  useResetState();

  return (
    <ExecutionContext.Provider value={{ info, onExecute }}>
      <Dialog open={open} setOpen={changeOpen}>
        <WrapperIntegrationModalDialog
          title="Connect to your data"
          tabStage={stage}
          connectionTabLabel={getConnectionDisplayLabel(connectionType)}
          showTabs={stage !== 'pick-integration'}
          onTabClick={(s) => setter({ stage: s })}
          onBack={back}
          onReset={codeStoreReset}
          onRun={() => {
            if (queries.hasReachedLimit) return;

            onExecute({ status: 'run' });
            queries.incrementUsageWithBackend(workspaceId);
          }}
          disableRunButton={info.status === 'run' || queries.hasReachedLimit}
          infoPanel={
            <UpgradeWarningBlock
              type="queries"
              variant="block"
              workspaceId={workspaceId}
            />
          }
          onContinue={next}
          setOpen={changeOpen}
          isEditing={!!existingIntegration}
          actionMenu={actionMenu}
          isCode={connectionType === 'codeconnection'}
          hideRunButton={
            connectionType === 'notion' || connectionType === 'gsheets'
          }
        >
          {screen}
        </WrapperIntegrationModalDialog>
      </Dialog>
    </ExecutionContext.Provider>
  );
};
