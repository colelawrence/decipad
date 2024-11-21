import { FC } from 'react';
import {
  ExternalProvider,
  useCreateExternalDataSourceMutation,
} from '@decipad/graphql-client';
import { nanoid } from 'nanoid';
import { TEMP_CONNECTION_NAME } from '@decipad/frontend-config';
import { OptionsList } from '@decipad/ui';
import { ConnectionProps } from '../types';
import { useWorkspaceConnections } from '../../hooks/useWorkspaceConnections';
import { getExternalDataAuthUrl } from '@decipad/notebook-tabs';

function onAuth(externalDataId: string) {
  window.location.replace(getExternalDataAuthUrl(externalDataId));
}

export const OAuthConnections: FC<
  ConnectionProps & { provider: ExternalProvider; label: string }
> = ({ workspaceId, provider, label, externalData, setExternalData }) => {
  const conn = useWorkspaceConnections(workspaceId, provider);

  const [, createDataSource] = useCreateExternalDataSourceMutation();

  async function onConnectIntegration() {
    const res = await createDataSource({
      dataSource: {
        externalId: nanoid(),

        provider,
        workspaceId,

        name: TEMP_CONNECTION_NAME,
      },
    });

    const newExternalData = res.data?.createExternalDataSource;

    if (newExternalData == null) {
      throw new Error('External data returned null');
    }

    onAuth(newExternalData.id);
  }

  return (
    <OptionsList
      name={externalData?.name}
      label={label}
      selections={conn}
      extraOption={{
        callback: onConnectIntegration,
        label: '+ Add New Connection',
      }}
      onSelect={setExternalData}
    />
  );
};
