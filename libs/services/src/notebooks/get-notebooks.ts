import { PadRecord, PagedResult, PageInput, User } from '@decipad/backendtypes';
import tables, { paginate } from '@decipad/tables';
import { byDesc } from '@decipad/utils';

interface GetNotebooksProps {
  user?: User;
  workspaceId: string;
  page: PageInput;
}

export const getNotebooks = async ({
  user,
  workspaceId,
  page,
}: GetNotebooksProps): Promise<PagedResult<PadRecord>> => {
  const data = await tables();

  const query = {
    IndexName: 'byUserId',
    KeyConditionExpression:
      'user_id = :user_id and resource_type = :resource_type',
    FilterExpression: 'parent_resource_uri = :parent_resource_uri',
    ExpressionAttributeValues: {
      ':user_id': user?.id || 'null',
      ':resource_type': 'pads',
      ':parent_resource_uri': `/workspaces/${workspaceId}`,
    },
  };

  const paged = await paginate(
    data.permissions,
    query,
    page,
    (perm) => perm.resource_id
  );
  const { items: notebookIds } = paged;
  const items = (await data.pads.batchGet(notebookIds)).sort(
    byDesc('createdAt')
  );
  return {
    ...paged,
    items,
  };
};
