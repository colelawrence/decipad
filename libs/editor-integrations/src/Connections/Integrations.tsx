import type { TExecution } from '@decipad/react-contexts';
import {
  ExecutionContext,
  getConnectionDisplayLabel,
  useCodeConnectionStore,
  useConnectionStore,
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
function useAbortOnMount() {
  const abort = useConnectionStore((store) => store.abort);

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
      connectionType !== 'mysql'
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
  const store = useConnectionStore();
  const codeStore = useCodeConnectionStore();

  useAbortOnMount();

  // TODO: Remove this from here, but for now it works.
  const [info, onExecute] = useState<TExecution<boolean>>({
    status: 'unset',
  });

  const screen = useIntegrationScreenFactory(workspaceId);
  const actionMenu = useConnectionActionMenu(workspaceId, onExecute);

  useCreateIntegration();
  useAnalytics();

  return (
    <ExecutionContext.Provider value={{ info, onExecute }}>
      <Dialog open={store.open} setOpen={store.changeOpen}>
        <WrapperIntegrationModalDialog
          title="Connect to your data"
          workspaceId={workspaceId}
          tabStage={store.stage}
          connectionTabLabel={getConnectionDisplayLabel(store.connectionType)}
          showTabs={store.stage !== 'pick-integration'}
          onTabClick={(stage) => store.Set({ stage })}
          onBack={store.back}
          onReset={codeStore.reset}
          onContinue={store.next}
          setOpen={store.changeOpen}
          isEditing={!!store.existingIntegration}
          actionMenu={actionMenu}
          isCode={store.connectionType === 'codeconnection'}
          hideRunButton={store.connectionType === 'notion'}
        >
          {screen}
        </WrapperIntegrationModalDialog>
      </Dialog>
    </ExecutionContext.Provider>
  );
};
