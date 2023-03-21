import { PadRecord, PagedResult, PageInput, User } from '@decipad/backendtypes';
import tables, { paginate } from '@decipad/tables';
import { byDesc } from '@decipad/utils';

const outputPad = (pad: PadRecord): PadRecord => {
  return {
    ...pad,
    createdAt: Number(pad.createdAt) * 1000,
  };
};

const getNotebooksById = async (
  notebookIds: string[]
): Promise<PadRecord[]> => {
  const data = await tables();
  let items: PadRecord[] = [];
  if (!Array.isArray(notebookIds)) {
    throw new Error('expected an array of strings');
  }
  for (let i = 0; i < notebookIds.length; i += 99) {
    const notebookIdsSlice = notebookIds.slice(i, i + 99);
    // eslint-disable-next-line no-await-in-loop
    const sliceItems = await data.pads.batchGet(notebookIdsSlice);
    items = items.concat(sliceItems);
  }
  const sortedItems = items.sort(byDesc('createdAt'));
  return sortedItems.map(outputPad);
};

interface GetWorkspaceNotebooksProps {
  user?: User;
  workspaceId: string;
  page: PageInput;
}

export const getWorkspaceNotebooks = async ({
  user,
  workspaceId,
  page,
}: GetWorkspaceNotebooksProps): Promise<PagedResult<PadRecord>> => {
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

  const paged = await paginate(data.permissions, query, page, {
    map: (perm) => perm.resource_id,
    gqlType: 'Permission',
  });
  const { items: notebookIds } = paged;
  return {
    ...paged,
    items: await getNotebooksById(notebookIds),
  };
};

interface GetNotebooksSharedWithProps {
  user: User;
  page: PageInput;
}

export const getNotebooksSharedWith = async ({
  user,
  page,
}: GetNotebooksSharedWithProps): Promise<PagedResult<PadRecord>> => {
  const data = await tables();

  const query = {
    IndexName: 'byUserId',
    KeyConditionExpression:
      'user_id = :user_id and resource_type = :resource_type',
    FilterExpression: 'given_by_user_id <> :user_id',
    ExpressionAttributeValues: {
      ':user_id': user.id,
      ':resource_type': 'pads',
    },
  };

  const paged = await paginate(data.permissions, query, page, {
    map: (perm) => perm.resource_id,
  });
  const { items: notebookIds } = paged;
  return {
    ...paged,
    items: await getNotebooksById(notebookIds),
  };
};
