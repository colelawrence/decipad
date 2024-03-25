import {
  ExternalDataSourceFragmentFragment,
  useCreateExternalDataSourceMutation,
} from '@decipad/graphql-client';
import { nanoid } from 'nanoid';
import { FC } from 'react';

function OnAuth(externalData: ExternalDataSourceFragmentFragment) {
  window.location.replace(
    `${window.location.origin}/api/externaldatasources/${externalData.id}/auth`
  );
}

interface ServicesProps {
  readonly workspaceId: string;
}

/**
 * Connect to various OAuth services
 *
 * So far:
 * - Notion
 */
export const Services: FC<ServicesProps> = ({ workspaceId }) => {
  const [, createDataSource] = useCreateExternalDataSourceMutation();

  async function OnConnectNotion() {
    const res = await createDataSource({
      dataSource: {
        externalId: nanoid(),
        workspaceId,
        provider: 'notion',

        name: 'to be changed when auth completes',
      },
    });

    const externalData = res.data?.createExternalDataSource;

    if (externalData == null) {
      throw new Error('External data returned null');
    }

    OnAuth(externalData);
  }

  return (
    <div>
      <button onClick={OnConnectNotion}>Notion</button>
    </div>
  );
};
