import {
  ExecutionContext,
  getConnectionDisplayLabel,
  useCodeConnectionStore,
  useConnectionStore,
  TExecution,
} from '@decipad/react-contexts';
import { Dialog, WrapperIntegrationModalDialog } from '@decipad/ui';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  useConnectionActionMenu,
  useCreateIntegration,
  useIntegrationScreenFactory,
} from '../hooks';
import { useClientEvents } from '@decipad/client-events';

interface IntegrationProps {
  readonly workspaceId?: string;
}

/**
 * When you navigate to the workspace, you might `leave` the store open.
 * So we need to clean up after the user.
 */
function useResetState() {
  const [abort] = useConnectionStore((store) => [store.abort]);

  useEffect(() => {
    abort();

    return () => {
      abort();
    };
  }, [abort]);
}

function useAnalytics() {
  const [stage, connectionType, createIntegration] = useConnectionStore((s) => [
    s.stage,
    s.connectionType,
    s.createIntegration,
  ]);

  const track = useClientEvents();

  useEffect(() => {
    if (
      connectionType !== 'notion' &&
      connectionType !== 'codeconnection' &&
      connectionType !== 'mysql' &&
      connectionType !== 'gsheets'
    ) {
      return;
    }

    if (stage === 'connect') {
      track({
        segmentEvent: {
          type: 'action',
          action: 'Integration: Notebook viewed',
          props: { type: connectionType },
        },
      });
    }

    if (createIntegration) {
      track({
        segmentEvent: {
          type: 'action',
          action: 'Integration: Notebook Integration added',
          props: { type: connectionType },
        },
      });
    }
  }, [connectionType, stage, track, createIntegration]);
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

  useResetState();

  const [info, onExecute] = useState<TExecution<boolean>>({
    status: 'unset',
  });

  const screen = useIntegrationScreenFactory(workspaceId);
  const actionMenu = useConnectionActionMenu(workspaceId, onExecute);

  useCreateIntegration();
  useAnalytics();

  return (
    <ExecutionContext.Provider value={{ info, onExecute }}>
      <Dialog open={open} setOpen={changeOpen}>
        <WrapperIntegrationModalDialog
          title="Connect to your data"
          workspaceId={workspaceId}
          tabStage={stage}
          connectionTabLabel={getConnectionDisplayLabel(connectionType)}
          showTabs={stage !== 'pick-integration'}
          onTabClick={(s) => setter({ stage: s })}
          onBack={back}
          onReset={codeStoreReset}
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
