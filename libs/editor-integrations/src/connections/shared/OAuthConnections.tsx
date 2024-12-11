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
import { labelStyle } from 'libs/ui/src/shared/atoms/Input/Input';

function onAuth(externalDataId: string) {
  window.location.replace(getExternalDataAuthUrl(externalDataId));
}

export const OAuthConnections: FC<
  ConnectionProps & {
    provider: ExternalProvider;
    label: string;
    placeholder: string;
  }
> = ({
  workspaceId,
  provider,
  label,
  placeholder,
  externalData,
  setExternalData,
}) => {
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
    <>
      <label css={labelStyle}>{label}</label>
      <OptionsList
        name={externalData?.name}
        label={placeholder}
        selections={conn}
        extraOption={{
          callback: onConnectIntegration,
          label: '+ Add New Connection',
        }}
        onSelect={setExternalData}
      />
    </>
  );
};
