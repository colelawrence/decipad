import {
  ExecutionContext,
  TExecution,
  useCodeConnectionStore,
  useConnectionStore,
} from '@decipad/react-contexts';
import { Dialog, WrapperIntegrationModalDialog } from '@decipad/ui';
import { FC, useState } from 'react';
import { useCreateIntegration, useIntegrationScreenFactory } from '../hooks';

interface IntegrationProps {
  readonly workspaceId?: string;
  readonly notebookId?: string;
}

export const Integrations: FC<IntegrationProps> = ({ workspaceId }) => {
  const store = useConnectionStore();
  const codeStore = useCodeConnectionStore();

  // TODO: Remove this from here, but for now it works.
  const [info, onExecute] = useState<TExecution<boolean>>({
    status: 'unset',
  });

  const screen = useIntegrationScreenFactory();
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
        >
          {screen}
        </WrapperIntegrationModalDialog>
      </Dialog>
    </ExecutionContext.Provider>
  );
};
