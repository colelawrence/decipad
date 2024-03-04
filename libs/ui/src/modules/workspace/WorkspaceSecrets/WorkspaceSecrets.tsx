import { useWorkspaceSecrets } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import React from 'react';
import { p14Medium } from '../../../primitives';
import { WorkspaceSecretsAddForm } from './WorkspaceSecretsAddForm.private';
import { WorkspaceSecretsTable } from './WorkspaceSecretsTable.private';

export type WorkspaceSecretsProps = {
  workspaceId: string;
  webhook?: boolean;
};

export const WorkspaceSecrets: React.FC<WorkspaceSecretsProps> = ({
  workspaceId,
  webhook = false,
}) => {
  const { secrets, add, remove } = useWorkspaceSecrets(workspaceId);

  const description = webhook
    ? 'Configure webhooks to receive real-time data updates from external services. Set up endpoints to capture and process incoming data efficiently.'
    : 'Securely store and manage access credentials for your integrations. API secrets ensure that your connections to external services are secure.';

  return (
    <div css={fullWidth}>
      <p css={paraSecretStyles}>{description}</p>{' '}
      <WorkspaceSecretsAddForm webhook={webhook} onAdd={add} />
      <WorkspaceSecretsTable secrets={secrets} onRemove={remove} />
    </div>
  );
};

const paraSecretStyles = css(p14Medium, { paddingBottom: 12 });
const fullWidth = css({
  width: '100%',
});
