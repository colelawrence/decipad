import {
  ExecutionContext,
  TExecution,
  useCodeConnectionStore,
  useConnectionStore,
} from '@decipad/react-contexts';
import { Dialog, WrapperIntegrationModalDialog } from '@decipad/ui';
import { FC, useEffect, useState } from 'react';
import {
  useConnectionActionMenu,
  useCreateIntegration,
  useIntegrationScreenFactory,
} from '../hooks';

interface IntegrationProps {
  readonly workspaceId?: string;
}

/** When you navigate to the workspace, you might `leave` the store open.
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

export const Integrations: FC<IntegrationProps> = ({ workspaceId = '' }) => {
  const store = useConnectionStore();
  const codeStore = useCodeConnectionStore();

  useAbortOnMount();

  // TODO: Remove this from here, but for now it works.
  const [info, onExecute] = useState<TExecution<boolean>>({
    status: 'unset',
  });

  const screen = useIntegrationScreenFactory();
  const actionMenu = useConnectionActionMenu(workspaceId, onExecute);
  useCreateIntegration();

  return (
    <ExecutionContext.Provider value={{ info, onExecute }}>
      <Dialog open={store.open} setOpen={store.changeOpen}>
        <WrapperIntegrationModalDialog
          title="Connect to your data"
          workspaceId={workspaceId}
          tabStage={store.stage}
          showTabs={store.stage !== 'pick-integration'}
          onTabClick={(stage) => store.setStage(stage)}
          onBack={store.back}
          onReset={codeStore.reset}
          onContinue={store.next}
          setOpen={store.changeOpen}
          isEditing={!!store.existingIntegration}
          actionMenu={actionMenu}
          isCode={store.connectionType === 'codeconnection'}
        >
          {screen}
        </WrapperIntegrationModalDialog>
      </Dialog>
    </ExecutionContext.Provider>
  );
};
