import { useWorkspaceSecrets } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import React from 'react';
import { p14Medium } from '../../primitives';
import { WorkspaceSecretsAddForm } from './WorkspaceSecretsAddForm.private';
import { WorkspaceSecretsTable } from './WorkspaceSecretsTable.private';

export type WorkspaceSecretsProps = {
  workspaceId: string;
};

export const WorkspaceSecrets: React.FC<WorkspaceSecretsProps> = ({
  workspaceId,
}) => {
  const { secrets, add, remove } = useWorkspaceSecrets(workspaceId);

  return (
    <div css={fullWidth}>
      <p css={paraSecretStyles}>
        You can define secrets to so that you can access services securely from
        your integrations.
      </p>{' '}
      <WorkspaceSecretsAddForm onAdd={add} />
      <WorkspaceSecretsTable secrets={secrets} onRemove={remove} />
    </div>
  );
};

const paraSecretStyles = css(p14Medium, { paddingBottom: 12 });
const fullWidth = css({
  width: '100%',
});
