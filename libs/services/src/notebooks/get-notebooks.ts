import { PadRecord, PagedResult, PageInput, User } from '@decipad/backendtypes';
import tables, { paginate } from '@decipad/tables';
import { byDesc } from '@decipad/utils';

const outputPad = (pad: PadRecord): PadRecord => {
  return {
    ...pad,
    createdAt: Number(pad.createdAt) * 1000,
  };
};

const outputPads = (pads: PadRecord[]) => {
  const sortedItems = pads.sort(byDesc('createdAt'));
  return sortedItems.map(outputPad);
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
  return outputPads(items);
};

interface GetWorkspaceNotebooksProps {
  user?: User;
  workspaceId: string;
  page: PageInput;
}

export const getWorkspaceNotebooks = async ({
  workspaceId,
  page,
}: GetWorkspaceNotebooksProps): Promise<PagedResult<PadRecord>> => {
  const data = await tables();

  const query = {
    IndexName: 'byWorkspaceOnly',
    KeyConditionExpression: 'workspace_id = :workspace_id',
    ExpressionAttributeValues: {
      ':workspace_id': workspaceId,
    },
  };

  const paged = await paginate(data.pads, query, page, {
    gqlType: 'Pad',
  });
  const { items: notebooks } = paged;

  return {
    ...paged,
    items: outputPads(notebooks),
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
