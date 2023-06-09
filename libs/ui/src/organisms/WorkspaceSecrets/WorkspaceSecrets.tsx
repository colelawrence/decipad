import React from 'react';
import { useWorkspaceSecrets } from '@decipad/graphql-client';
import { WorkspaceSecretsTable } from './WorkspaceSecretsTable.private';
import { WorkspaceSecretsAddForm } from './WorkspaceSecretsAddForm.private';

export type WorkspaceSecretsProps = {
  workspaceId: string;
};

export const WorkspaceSecrets: React.FC<WorkspaceSecretsProps> = ({
  workspaceId,
}) => {
  const { secrets, add, remove } = useWorkspaceSecrets(workspaceId);

  return (
    <div>
      <WorkspaceSecretsAddForm onAdd={add} />
      <WorkspaceSecretsTable secrets={secrets} onRemove={remove} />
    </div>
  );
};
